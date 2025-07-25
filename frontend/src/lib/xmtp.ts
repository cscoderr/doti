// import * as fs from "fs";
// import {
//   XmtpEnv,
//   Client,
//   type Conversation,
//   type DecodedMessage,
// } from "@xmtp/node-sdk";
// import { createSigner, getEncryptionKeyFromHex } from "./xmtp-helper";
// import { HumanMessage } from "@langchain/core/messages";
// import { createReactAgent } from "@langchain/langgraph/prebuilt";
// import { ChatOpenAI } from "@langchain/openai";
// import { MemorySaver } from "@langchain/langgraph";
// import {
//   AgentKit,
//   cdpApiActionProvider,
//   cdpWalletActionProvider,
//   CdpWalletProvider,
//   erc20ActionProvider,
//   walletActionProvider,
// } from "@coinbase/agentkit";
// import { getLangChainTools } from "@coinbase/agentkit-langchain";
// import { agentPrompt } from "./prompt";

// // Storage constants
// const XMTP_STORAGE_DIR = ".data/xmtp";
// const WALLET_STORAGE_DIR = ".data/wallet";

// const memoryStore: Record<string, MemorySaver> = {};
// const agentStore: Record<string, Agent> = {};

// interface AgentConfig {
//   configurable: {
//     thread_id: string;
//   };
// }

// type Agent = ReturnType<typeof createReactAgent>;

// /**
//  * Ensure local storage directory exists
//  */
// export function ensureLocalStorage() {
//   if (!fs.existsSync(XMTP_STORAGE_DIR)) {
//     fs.mkdirSync(XMTP_STORAGE_DIR, { recursive: true });
//   }
//   if (!fs.existsSync(WALLET_STORAGE_DIR)) {
//     fs.mkdirSync(WALLET_STORAGE_DIR, { recursive: true });
//   }
// }

// /**
//  * Save wallet data to storage.
//  *
//  * @param userId - The unique identifier for the user
//  * @param walletData - The wallet data to be saved
//  */
// export function saveWalletData(userId: string, walletData: string) {
//   const localFilePath = `${WALLET_STORAGE_DIR}/${userId}.json`;
//   try {
//     if (!fs.existsSync(localFilePath)) {
//       console.log(`Wallet data saved for user ${userId}`);
//       fs.writeFileSync(localFilePath, walletData);
//     }
//   } catch (error) {
//     console.error(`Failed to save wallet data to file: ${error as string}`);
//   }
// }

// /**
//  * Get wallet data from storage.
//  *
//  * @param userId - The unique identifier for the user
//  * @returns The wallet data as a string, or null if not found
//  */
// export function getWalletData(userId: string): string | null {
//   const localFilePath = `${WALLET_STORAGE_DIR}/${userId}.json`;
//   try {
//     if (fs.existsSync(localFilePath)) {
//       return fs.readFileSync(localFilePath, "utf8");
//     }
//   } catch (error) {
//     console.warn(`Could not read wallet data from file: ${error as string}`);
//   }
//   return null;
// }

// export async function initializeXmtpClient() {
//   const signer = await createSigner(process.env.PRIVATE_KEY as string);
//   const dbEncryptionKey = getEncryptionKeyFromHex(
//     process.env.ENCRYPTION_KEY as string
//   );

//   const identifier = await signer.getIdentifier();
//   const address = identifier.identifier;

//   const client = await Client.create(signer, {
//     dbEncryptionKey,
//     env: process.env.XMTP_ENV as XmtpEnv,
//     dbPath: XMTP_STORAGE_DIR + `/${process.env.XMTP_ENV}-${address}`,
//   });

//   /* Sync the conversations from the network to update the local db */
//   console.log("✓ Syncing conversations...");
//   await client.conversations.sync();

//   return client;
// }

// /**
//  * Initialize the agent with CDP Agentkit.
//  *
//  * @param userId - The unique identifier for the user
//  * @returns The initialized agent and its configuration
//  */
// async function initializeAgent(
//   userId: string
// ): Promise<{ agent: Agent; config: AgentConfig }> {
//   try {
//     const llm = new ChatOpenAI({
//       model: "gpt-4.1-mini",
//       apiKey: process.env.OPEN_AI_KEY,
//     });

//     const storedWalletData = getWalletData(userId);
//     console.log(
//       `Wallet data for ${userId}: ${storedWalletData ? "Found" : "Not found"}`
//     );

//     const walletProvider = await CdpWalletProvider.configureWithWallet({
//       apiKeyId: process.env.CDP_API_KEY_ID,
//       apiKeySecret: process.env.CDP_API_KEY_SECRET,
//       cdpWalletData: storedWalletData || undefined,
//       networkId: "base-sepolia",
//     });

//     const agentkit = await AgentKit.from({
//       walletProvider,
//       actionProviders: [
//         walletActionProvider(),
//         erc20ActionProvider(),
//         cdpApiActionProvider({
//           apiKeyId: process.env.CDP_API_KEY_ID,
//           apiKeySecret: process.env.CDP_API_KEY_SECRET,
//         }),
//         cdpWalletActionProvider({
//           apiKeyId: process.env.CDP_API_KEY_ID,
//           apiKeySecret: process.env.CDP_API_KEY_SECRET,
//         }),
//       ],
//     });

//     const tools = await getLangChainTools(agentkit);

//     memoryStore[userId] = new MemorySaver();

//     const agentConfig: AgentConfig = {
//       configurable: { thread_id: userId },
//     };

//     const agent = createReactAgent({
//       llm,
//       tools,
//       checkpointSaver: memoryStore[userId],
//       prompt: agentPrompt,
//     });

//     agentStore[userId] = agent;

//     const exportedWallet = await walletProvider.exportWallet();
//     const walletDataJson = JSON.stringify(exportedWallet);
//     saveWalletData(userId, walletDataJson);

//     return { agent, config: agentConfig };
//   } catch (error) {
//     console.error("Failed to initialize agent:", error);
//     throw error;
//   }
// }

// /**
//  * Process a message with the agent.
//  *
//  * @param agent - The agent instance to process the message
//  * @param config - The agent configuration
//  * @param message - The message to process
//  * @returns The processed response as a string
//  */
// async function processMessage(
//   agent: Agent,
//   config: AgentConfig,
//   message: string
// ): Promise<string> {
//   let response = "";

//   try {
//     const stream = await agent.stream(
//       { messages: [new HumanMessage(message)] },
//       config
//     );

//     for await (const chunk of stream) {
//       if (chunk && typeof chunk === "object" && "agent" in chunk) {
//         const agentChunk = chunk as {
//           agent: { messages: Array<{ content: unknown }> };
//         };
//         response += String(agentChunk.agent.messages[0].content) + "\n";
//       }
//     }

//     return response.trim();
//   } catch (error) {
//     console.error("Error processing message:", error);
//     return "Sorry, I encountered an error while processing your request. Please try again later.";
//   }
// }

// /**
//  * Handle incoming XMTP messages.
//  *
//  * @param message - The decoded XMTP message
//  * @param client - The XMTP client instance
//  */
// async function handleMessage(message: DecodedMessage, client: Client) {
//   let conversation: Conversation | null = null;
//   try {
//     const senderAddress = message.senderInboxId;
//     const botAddress = client.inboxId.toLowerCase();

//     // Ignore messages from the bot itself
//     if (senderAddress.toLowerCase() === botAddress) {
//       return;
//     }

//     console.log(
//       `Received message from ${senderAddress}: ${message.content as string}`
//     );

//     const { agent, config } = await initializeAgent(senderAddress);
//     const response = await processMessage(
//       agent,
//       config,
//       String(message.content)
//     );

//     // Get the conversation and send response
//     conversation = (await client.conversations.getConversationById(
//       message.conversationId
//     )) as Conversation | null;
//     if (!conversation) {
//       throw new Error(
//         `Could not find conversation for ID: ${message.conversationId}`
//       );
//     }
//     await conversation.send(response);
//     console.debug(`Sent response to ${senderAddress}: ${response}`);
//   } catch (error) {
//     console.error("Error handling message:", error);
//     if (conversation) {
//       await conversation.send(
//         "I encountered an error while processing your request. Please try again later."
//       );
//     }
//   }
// }

// /**
//  * Start listening for XMTP messages.
//  *
//  * @param client - The XMTP client instance
//  */
// export async function startMessageListener(client: Client) {
//   console.log("Starting message listener...");
//   const stream = await client.conversations.streamAllMessages();
//   for await (const message of stream) {
//     if (message) {
//       await handleMessage(message, client);
//     }
//   }
// }

// /**
//  * Main function to start the chatbot.
//  */
// async function main(): Promise<void> {
//   console.log("Initializing Agent on XMTP...");

//   ensureLocalStorage();

//   const xmtpClient = await initializeXmtpClient();
//   await startMessageListener(xmtpClient);
// }

// // Start the chatbot
// main().catch(console.error);
