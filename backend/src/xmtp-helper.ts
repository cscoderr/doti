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
import { getAddress, parseUnits } from "viem";
import { dotiAgentPrompt } from "./prompt";
import {
  createSigner,
  getEncryptionKeyFromHex,
  getSubscriptions,
  getTokenBalance,
  logAgentDetails,
  validateEnvironment,
} from "./helper";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { SpendPermission } from "./types/SpendPermission";
import { chargeUser } from "./smartSpender";
import { base, baseSepolia } from "viem/chains";
import { ContentTypeTransactionReference } from "@xmtp/content-type-transaction-reference";

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

// Global stores for memory and agent instances
const memoryStore: Record<string, MemorySaver> = {};
const agentStore: Record<string, Agent> = {};

interface AgentConfig {
  configurable: {
    thread_id: string;
  };
}

type Agent = ReturnType<typeof createReactAgent>;

/**
 * Ensure local storage directory exists
 */
export function ensureLocalStorage() {
  if (!fs.existsSync(XMTP_STORAGE_DIR)) {
    fs.mkdirSync(XMTP_STORAGE_DIR, { recursive: true });
  }
  if (!fs.existsSync(WALLET_STORAGE_DIR)) {
    fs.mkdirSync(WALLET_STORAGE_DIR, { recursive: true });
  }
}

/**
 * Save wallet data to storage.
 *
 * @param userId - The unique identifier for the user
 * @param walletData - The wallet data to be saved
 */
function saveWalletData(userId: string, walletData: string) {
  const localFilePath = `${WALLET_STORAGE_DIR}/${userId}.json`;
  try {
    if (!fs.existsSync(localFilePath)) {
      console.log(`Wallet data saved for user ${userId}`);
      fs.writeFileSync(localFilePath, walletData);
    }
  } catch (error) {
    console.error(`Failed to save wallet data to file: ${error as string}`);
  }
}

/**
 * Get wallet data from storage.
 *
 * @param userId - The unique identifier for the user
 * @returns The wallet data as a string, or null if not found
 */
function getWalletData(userId: string): string | null {
  const localFilePath = `${WALLET_STORAGE_DIR}/${userId}.json`;
  try {
    if (fs.existsSync(localFilePath)) {
      return fs.readFileSync(localFilePath, "utf8");
    }
  } catch (error) {
    console.warn(`Could not read wallet data from file: ${error as string}`);
  }
  return null;
}
/**
 * Initialize the XMTP client.
 *
 * @returns An initialized XMTP Client instance
 */
export async function initializeXmtpClient() {
  const signer = createSigner(WALLET_KEY as string);
  const dbEncryptionKey = getEncryptionKeyFromHex(ENCRYPTION_KEY as string);

  const identifier = await signer.getIdentifier();
  const address = identifier.identifier;

  console.log("Creating XMTP client with:", {
    env: XMTP_ENV,
    address,
    dbPath: XMTP_STORAGE_DIR + `/${XMTP_ENV}-${address}`,
    encryptionKey: ENCRYPTION_KEY,
  });

  const client = await Client.create(signer, {
    dbEncryptionKey,
    env: XMTP_ENV as XmtpEnv,
    dbPath: XMTP_STORAGE_DIR + `/${XMTP_ENV}-${address}`,
  });

  await logAgentDetails(client);

  /* Sync the conversations from the network to update the local db */
  console.log("✓ Syncing conversations...");
  await client.conversations.sync();

  return client;
}

/**
 * Initialize the agent with CDP Agentkit.
 *
 * @param userId - The unique identifier for the user
 * @returns The initialized agent and its configuration
 */
export async function initializeAgent(
  userId: string
): Promise<{ agent: Agent; config: AgentConfig }> {
  try {
    const llm = new ChatOpenAI({
      model: "gpt-4.1-mini",
      apiKey: OPEN_AI_KEY,
    });

    const storedWalletData = getWalletData(userId);
    console.log(
      `Wallet data for ${userId}: ${storedWalletData ? "Found" : "Not found"}`
    );

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

    if (!memoryStore[userId]) {
      memoryStore[userId] = new MemorySaver();
    }

    const agentConfig: AgentConfig = {
      configurable: { thread_id: userId },
    };

    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memoryStore[userId],
      prompt: dotiAgentPrompt,
    });

    agentStore[userId] = agent;

    const exportedWallet = await walletProvider.exportWallet();
    const walletDataJson = JSON.stringify(exportedWallet);
    saveWalletData(userId, walletDataJson);

    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

/**
 * Process a message with the agent.
 *
 * @param agent - The agent instance to process the message
 * @param config - The agent configuration
 * @param message - The message to process
 * @returns The processed response as a string
 */
export async function processMessage(
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

/**
 * Handle incoming XMTP messages.
 *
 * @param message - The decoded XMTP message
 * @param client - The XMTP client instance
 */
async function handleMessage(message: DecodedMessage, client: Client) {
  let conversation: Conversation | null = null;
  try {
    const senderAddress = message.senderInboxId;
    const botAddress = client.inboxId.toLowerCase();

    // Ignore messages from the bot itself
    if (senderAddress.toLowerCase() === botAddress) {
      return;
    }

    console.log(
      `Received message from ${senderAddress}: ${message.content as string}`
    );

    const { agent, config } = await initializeAgent(senderAddress);
    const response = await processMessage(
      agent,
      config,
      String(message.content)
    );

    // Get the conversation and send response
    conversation = (await client.conversations.getConversationById(
      message.conversationId
    )) as Conversation | null;
    if (!conversation) {
      throw new Error(
        `Could not find conversation for ID: ${message.conversationId}`
      );
    }
    await conversation.send(response);
    console.debug(`Sent response to ${senderAddress}: ${response}`);
  } catch (error) {
    console.error("Error handling message:", error);
    if (conversation) {
      await conversation.send(
        "I encountered an error while processing your request. Please try again later."
      );
    }
  }
}

/**
 * Start listening for XMTP messages.
 *
 * @param client - The XMTP client instance
 */
export async function startMessageListener(client: Client) {
  console.log("Starting message listener...");
  const stream = await client.conversations.streamAllMessages();
  for await (const message of stream) {
    if (message) {
      await handleMessage(message, client);
    }
  }
}

export async function chargeUserAndSendMessage({
  fees,
  conversation,
  message,
  address,
  agentId,
}: {
  fees: number;
  conversation: Conversation;
  message: unknown;
  address: string;
  agentId: string;
}) {
  const subscription = await getSubscriptions(address, agentId);

  const balance = await getTokenBalance({
    address: getAddress(subscription.spendPermission.account),
    tokenAddress: getAddress(subscription.spendPermission.token),
  });

  if (balance < parseUnits(fees.toString(), 6)) {
    conversation.send("Insufficient Funds. Top up your wallet and try again.");
    return;
  }

  const transactionHash = await chargeUser(subscription.spendPermission, fees);

  if (!transactionHash || transactionHash === "") {
    conversation.send("Oops! Payment didn't go through");
    return;
  }
  console.log("sendinng message here", message);

  conversation.send(message);
  await conversation.send(
    {
      namespace: "eip155",
      networkId:
        process.env.NETWORK_ID === "base-mainnet" ? base.id : baseSepolia.id,
      reference: transactionHash,
    },
    ContentTypeTransactionReference
  );
}
