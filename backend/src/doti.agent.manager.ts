import * as fs from "fs";
import {
  AgentKit,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  CdpWalletProvider,
  erc20ActionProvider,
  walletActionProvider,
} from "@coinbase/agentkit";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import {
  Client,
  type Conversation,
  type DecodedMessage,
  type XmtpEnv,
} from "@xmtp/node-sdk";
import {
  createSigner,
  getEncryptionKeyFromHex,
  logAgentDetails,
  validateEnvironment,
} from "./helper";
import { randomBytes } from "crypto";
import { getLangChainTools } from "@coinbase/agentkit-langchain";

const {
  WALLET_KEY,
  ENCRYPTION_KEY,
  XMTP_ENV,
  CDP_API_KEY_ID,
  CDP_API_KEY_SECRET,
  NETWORK_ID,
  OPEN_AI_KEY,
} = validateEnvironment([
  "WALLET_KEY",
  "ENCRYPTION_KEY",
  "XMTP_ENV",
  "CDP_API_KEY_ID",
  "CDP_API_KEY_SECRET",
  "NETWORK_ID",
  "OPEN_AI_KEY",
]);

// Storage constants
const XMTP_STORAGE_DIR = ".data/xmtp";
const WALLET_STORAGE_DIR = ".data/wallet";
const AGENT_CONFIG_DIR = ".data/agents";
const USER_STORAGE_DIR = ".data/users";

// Types
interface AgentConfig {
  configurable: {
    thread_id: string;
  };
}

export interface UserAgent {
  id: string;
  name: string;
  description: string;
  prompt: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: string;
  xmtpAddress?: string;
  walletKey: string;
}

export interface UserProfile {
  id: string;
  address: string;
  agents: string[];
  createdAt: string;
}

type Agent = ReturnType<typeof createReactAgent>;

// Global stores
const memoryStore: Record<string, MemorySaver> = {};
const agentStore: Record<string, Agent> = {};
const xmtpClientStore: Record<string, Client> = {};
const runningAgents: Set<string> = new Set();

/**
 * Agent Management System
 */
export class DotiAgentManager {
  private static instance: DotiAgentManager;

  static getInstance(): DotiAgentManager {
    if (!DotiAgentManager.instance) {
      DotiAgentManager.instance = new DotiAgentManager();
    }
    return DotiAgentManager.instance;
  }

  constructor() {
    this.ensureLocalStorage();
  }

  /**
   * Ensure all storage directories exist
   */
  private ensureLocalStorage() {
    const dirs = [
      XMTP_STORAGE_DIR,
      WALLET_STORAGE_DIR,
      AGENT_CONFIG_DIR,
      USER_STORAGE_DIR,
    ];
    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Create a new user profile
   */
  async createUser(address: string): Promise<UserProfile> {
    const userId = this.generateUserId(address);
    const userProfile: UserProfile = {
      id: userId,
      address,
      agents: [],
      createdAt: new Date().toISOString(),
    };

    this.saveUserProfile(userProfile);
    return userProfile;
  }

  /**
   * Get user profile by address
   */
  getUserProfile(address: string): UserProfile | null {
    const userId = this.generateUserId(address);
    const filePath = `${USER_STORAGE_DIR}/${userId}.json`;

    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn(`Could not read user profile: ${error}`);
    }
    return null;
  }

  /**
   * Save user profile
   */
  private saveUserProfile(profile: UserProfile) {
    const filePath = `${USER_STORAGE_DIR}/${profile.id}.json`;
    fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
  }

  /**
   * Create a new agent for a user
   */
  async createAgent(
    ownerId: string,
    name: string,
    description: string,
    prompt: string,
    isPublic: boolean = false
  ): Promise<UserAgent> {
    const agentId = this.generateAgentId();
    const walletKey = this.generateWalletKey();

    const agent: UserAgent = {
      id: agentId,
      name,
      description,
      prompt,
      ownerId,
      isPublic,
      createdAt: new Date().toISOString(),
      walletKey,
    };

    // Save agent configuration
    this.saveAgentConfig(agent);

    // Update user profile
    const userProfile = this.getUserProfile(ownerId);
    if (userProfile) {
      userProfile.agents.push(agentId);
      this.saveUserProfile(userProfile);
    }

    return agent;
  }

  /**
   * Start an agent instance
   */
  async startAgent(agentId: string): Promise<void> {
    if (runningAgents.has(agentId)) {
      console.log(`Agent ${agentId} is already running`);
      return;
    }

    const agentConfig = this.getAgentConfig(agentId);
    if (!agentConfig) {
      throw new Error(`Agent ${agentId} not found`);
    }

    try {
      // Initialize XMTP client for this agent
      const xmtpClient = await this.initializeXmtpClient(agentConfig);
      xmtpClientStore[agentId] = xmtpClient;

      // Start message listener for this agent
      this.startAgentMessageListener(agentId, xmtpClient, agentConfig);

      runningAgents.add(agentId);
      console.log(
        `✓ Agent ${agentConfig.name} (${agentId}) started successfully`
      );
    } catch (error) {
      console.error(`Failed to start agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Stop an agent instance
   */
  async stopAgent(agentId: string): Promise<void> {
    if (!runningAgents.has(agentId)) {
      console.log(`Agent ${agentId} is not running`);
      return;
    }

    // Clean up resources
    if (xmtpClientStore[agentId]) {
      delete xmtpClientStore[agentId];
    }
    if (agentStore[agentId]) {
      delete agentStore[agentId];
    }
    if (memoryStore[agentId]) {
      delete memoryStore[agentId];
    }

    runningAgents.delete(agentId);
    console.log(`✓ Agent ${agentId} stopped`);
  }

  /**
   * Get agent configuration
   */
  getAgentConfig(agentId: string): UserAgent | null {
    const filePath = `${AGENT_CONFIG_DIR}/${agentId}.json`;

    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn(`Could not read agent config: ${error}`);
    }
    return null;
  }

  /**
   * Save agent configuration
   */
  private saveAgentConfig(agent: UserAgent) {
    const filePath = `${AGENT_CONFIG_DIR}/${agent.id}.json`;
    fs.writeFileSync(filePath, JSON.stringify(agent, null, 2));
  }

  deleteAgentConfig(agentId: string) {
    const filePath = `${AGENT_CONFIG_DIR}/${agentId}.json`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * List all agents for a user
   */
  getUserAgents(userId: string): UserAgent[] {
    const userProfile = this.getUserProfile(userId);
    if (!userProfile) return [];

    return userProfile.agents
      .map((agentId) => this.getAgentConfig(agentId))
      .filter((agent) => agent !== null) as UserAgent[];
  }

  /**
   * Get a particular agent
   */
  getAgent(agentId: string): UserAgent | null {
    const filePath = `${AGENT_CONFIG_DIR}/${agentId}.json`;

    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn(`Could not read agent config: ${error}`);
    }
    return null;
  }

  /**
   * List all public agents
   */
  getPublicAgents(): UserAgent[] {
    const agents: UserAgent[] = [];

    try {
      const files = fs.readdirSync(AGENT_CONFIG_DIR);
      for (const file of files) {
        if (file.endsWith(".json")) {
          const agentConfig = this.getAgentConfig(file.replace(".json", ""));
          if (agentConfig && agentConfig.isPublic) {
            agents.push(agentConfig);
          }
        }
      }
    } catch (error) {
      console.warn(`Could not read agent directory: ${error}`);
    }

    return agents;
  }

  /**
   * Initialize XMTP client for a specific agent
   */
  private async initializeXmtpClient(agentConfig: UserAgent): Promise<Client> {
    const signer = createSigner(agentConfig.walletKey || WALLET_KEY);
    const dbEncryptionKey = getEncryptionKeyFromHex(ENCRYPTION_KEY);
    const identifier = await signer.getIdentifier();
    const address = identifier.identifier;

    const client = await Client.create(signer, {
      dbEncryptionKey,
      env: XMTP_ENV as XmtpEnv,
      dbPath: `${XMTP_STORAGE_DIR}/${XMTP_ENV}-${agentConfig.id}-${address}`,
    });

    // Store the XMTP address for the agent
    agentConfig.xmtpAddress = address;
    this.saveAgentConfig(agentConfig);

    console.log(
      `✓ XMTP client initialized for agent ${agentConfig.name} at ${address}`
    );
    await client.conversations.sync();

    return client;
  }

  /**
   * Initialize agent with custom prompt
   */
  private async initializeAgentInstance(
    agentConfig: UserAgent,
    userId: string
  ): Promise<{ agent: Agent; config: AgentConfig }> {
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      apiKey: OPEN_AI_KEY,
    });

    const storedWalletData = this.getWalletData(`${agentConfig.id}-${userId}`);

    const walletProvider = await CdpWalletProvider.configureWithWallet({
      apiKeyId: CDP_API_KEY_ID,
      apiKeySecret: CDP_API_KEY_SECRET,
      cdpWalletData: storedWalletData || undefined,
      networkId: NETWORK_ID,
    });

    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        walletActionProvider(),
        erc20ActionProvider(),
        cdpApiActionProvider({
          apiKeyId: CDP_API_KEY_ID,
          apiKeySecret: CDP_API_KEY_SECRET,
        }),
        cdpWalletActionProvider({
          apiKeyId: CDP_API_KEY_ID,
          apiKeySecret: CDP_API_KEY_SECRET,
        }),
      ],
    });

    const tools = await getLangChainTools(agentkit);
    const memoryKey = `${agentConfig.id}-${userId}`;

    if (!memoryStore[memoryKey]) {
      memoryStore[memoryKey] = new MemorySaver();
    }

    const config: AgentConfig = {
      configurable: { thread_id: memoryKey },
    };

    // Create custom prompt that includes the agent's personality
    const customPrompt = `${agentConfig.prompt}\n\nYou are ${agentConfig.name}: ${agentConfig.description}`;

    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memoryStore[memoryKey],
      messageModifier: customPrompt,
    });

    // Save wallet data
    const exportedWallet = await walletProvider.exportWallet();
    this.saveWalletData(
      `${agentConfig.id}-${userId}`,
      JSON.stringify(exportedWallet)
    );

    return { agent, config };
  }

  /**
   * Start message listener for a specific agent
   */
  private async startAgentMessageListener(
    agentId: string,
    client: Client,
    agentConfig: UserAgent
  ) {
    console.log(`Starting message listener for agent ${agentConfig.name}...`);

    const stream = await client.conversations.streamAllMessages();

    for await (const message of stream) {
      if (message) {
        await this.handleAgentMessage(message, client, agentConfig);
      }
    }
  }

  /**
   * Handle incoming messages for a specific agent
   */
  private async handleAgentMessage(
    message: DecodedMessage,
    client: Client,
    agentConfig: UserAgent
  ) {
    let conversation: Conversation | null = null;

    try {
      const senderAddress = message.senderInboxId;
      const botAddress = client.inboxId.toLowerCase();

      // Ignore messages from the bot itself
      if (senderAddress.toLowerCase() === botAddress) {
        return;
      }

      console.log(
        `Agent ${agentConfig.name} received message from ${senderAddress}: ${message.content}`
      );

      // Initialize agent instance for this user
      const { agent, config } = await this.initializeAgentInstance(
        agentConfig,
        senderAddress
      );

      const response = await this.processMessage(
        agent,
        config,
        String(message.content)
      );

      // Send response
      conversation = (await client.conversations.getConversationById(
        message.conversationId
      )) as Conversation | null;

      if (!conversation) {
        throw new Error(
          `Could not find conversation for ID: ${message.conversationId}`
        );
      }

      await conversation.send(response);
      console.log(
        `Agent ${agentConfig.name} sent response to ${senderAddress}`
      );
    } catch (error) {
      console.error(`Error in agent ${agentConfig.id}:`, error);
      if (conversation) {
        await conversation.send(
          `Hello! I'm ${agentConfig.name}. I encountered an error while processing your request. Please try again later.`
        );
      }
    }
  }

  /**
   * Process message with agent
   */
  private async processMessage(
    agent: Agent,
    config: AgentConfig,
    message: string
  ): Promise<string> {
    let response = "";

    try {
      const stream = await agent.stream(
        { messages: [new HumanMessage(message)] },
        config
      );

      for await (const chunk of stream) {
        if (chunk && typeof chunk === "object" && "agent" in chunk) {
          const agentChunk = chunk as {
            agent: { messages: Array<{ content: unknown }> };
          };
          response += String(agentChunk.agent.messages[0].content) + "\n";
        }
      }

      return response.trim();
    } catch (error) {
      console.error("Error processing message:", error);
      return "Sorry, I encountered an error while processing your request. Please try again later.";
    }
  }

  // Helper methods
  private generateUserId(address: string): string {
    return address.toLowerCase();
  }

  private generateAgentId(): string {
    return `agent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateWalletKey(): string {
    // Generates a 32-byte (256-bit) secure private key in hex format
    return `0x${randomBytes(32).toString("hex")}`;
  }

  private getWalletData(key: string): string | null {
    const filePath = `${WALLET_STORAGE_DIR}/${key}.json`;
    try {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, "utf8");
      }
    } catch (error) {
      console.warn(`Could not read wallet data: ${error}`);
    }
    return null;
  }

  private saveWalletData(key: string, data: string) {
    const filePath = `${WALLET_STORAGE_DIR}/${key}.json`;
    try {
      fs.writeFileSync(filePath, data);
    } catch (error) {
      console.error(`Failed to save wallet data: ${error}`);
    }
  }
}

/**
 * API Interface for managing agents
 */
export class DotiAPI {
  private agentManager: DotiAgentManager;

  constructor() {
    this.agentManager = DotiAgentManager.getInstance();
  }

  /**
   * Create a new user
   */
  async createUser(address: string): Promise<UserProfile> {
    return await this.agentManager.createUser(address);
  }

  /**
   * Create a new agent
   */
  async createAgent(
    ownerAddress: string,
    name: string,
    description: string,
    prompt: string,
    isPublic: boolean = false
  ): Promise<UserAgent> {
    const ownerId = ownerAddress.toLowerCase();
    let userProfile = this.agentManager.getUserProfile(ownerId);

    if (!userProfile) {
      userProfile = await this.agentManager.createUser(ownerId);
    }

    return await this.agentManager.createAgent(
      ownerId,
      name,
      description,
      prompt,
      isPublic
    );
  }

  /**
   * Start an agent
   */
  async startAgent(agentId: string): Promise<void> {
    return await this.agentManager.startAgent(agentId);
  }

  /**
   * Stop an agent
   */
  async stopAgent(agentId: string): Promise<void> {
    return await this.agentManager.stopAgent(agentId);
  }

  /**
   * Get user's agents
   */
  getUserAgents(address: string): UserAgent[] {
    return this.agentManager.getUserAgents(address.toLowerCase());
  }

  /**
   * Get public agents
   */
  getPublicAgents(): UserAgent[] {
    return this.agentManager.getPublicAgents();
  }

  /**
   * Get agent details
   */
  getAgent(agentId: string): UserAgent | null {
    return this.agentManager.getAgentConfig(agentId);
  }
}
