// import {
//   AgentKit,
//   basenameActionProvider,
//   cdpApiActionProvider,
//   cdpWalletActionProvider,
//   CdpWalletProvider,
//   erc20ActionProvider,
//   walletActionProvider,
// } from "@coinbase/agentkit";
// import { ChatOpenAI } from "@langchain/openai";
// import { getLangChainTools } from "@coinbase/agentkit-langchain";
// import { createReactAgent } from "@langchain/langgraph/prebuilt";
// import { agentPrompt } from "./prompt";
import { Signer } from "@xmtp/browser-sdk";
import { toBytes } from "viem";

const signatureCache: Record<string, Uint8Array> = {};

// const walletProvider = await CdpWalletProvider.configureWithWallet({
//   apiKeyId: process.env.CDP_API_KEY_ID,
//   apiKeySecret: process.env.CDP_API_KEY_SECRET,
//   networkId: "base-sepolia",
// });

// export const agentKit = await AgentKit.from({
//   walletProvider,
//   actionProviders: [
//     basenameActionProvider(),
//     walletActionProvider(),
//     erc20ActionProvider(),
//     cdpApiActionProvider({
//       apiKeyId: process.env.CDP_API_KEY_ID,
//       apiKeySecret: process.env.CDP_API_KEY_SECRET,
//     }),
//     cdpWalletActionProvider({
//       apiKeyId: process.env.CDP_API_KEY_ID,
//       apiKeySecret: process.env.CDP_API_KEY_SECRET,
//     }),
//   ],
// });

// const tools = await getLangChainTools(agentKit);

// const llm = new ChatOpenAI({
//   model: "gpt-4o-mini",
//   apiKey: process.env.OPEN_AI_KEY,
// });

// createReactAgent({
//   llm,
//   tools,
//   prompt: agentPrompt,
// });

// const result = await agent.invoke({
//   messages: ["Register the name coolguy for my wallet"],
// });

// console.log(result.structuredResponse);

// export const createSCWSigner = (
//   address: `0x${string}`,
//   signMessage: (message: string) => Promise<string> | string,
//   chainId = 1
// ): Signer => {
//   return {
//     type: "SCW",
//     getIdentifier: () => ({
//       identifier: address.toLowerCase(),
//       identifierKind: "Ethereum",
//     }),
//     signMessage: async (message: string) => {
//       const signature = await signMessage(message);
//       const signatureBytes = toBytes(signature);
//       return signatureBytes;
//     },
//     getChainId: () => BigInt(chainId),
//   };
// };

// Helper to create a cache key from address and message
const createCacheKey = (address: string, message: string): string => {
  return `${address.toLowerCase()}:${message}`;
};

export const createSCWSigner = (
  address: `0x${string}`,
  signMessageAsync: (args: { message: string }) => Promise<`0x${string}`>,
  chainId: bigint | number = 1
): Signer => {
  console.log("Creating Smart Contract Wallet signer for address:", address);

  return {
    // Mark this as a Smart Contract Wallet signer
    type: "SCW",
    getIdentifier: () => ({
      identifier: address.toLowerCase(),
      identifierKind: "Ethereum",
    }),
    signMessage: async (message: string) => {
      const cacheKey = createCacheKey(address, message);

      // Check if we have a cached signature
      if (signatureCache[cacheKey]) {
        console.log("Using cached Smart Contract Wallet signature");
        return signatureCache[cacheKey];
      }

      // Sign the message using the smart contract wallet
      console.log("Smart Contract Wallet signing message");
      try {
        const signature = await signMessageAsync({ message });
        console.log("Smart Contract Wallet signature received:", signature);

        const signatureBytes = toBytes(signature);
        console.log("Signature bytes length:", signatureBytes.length);

        // Cache the signature
        signatureCache[cacheKey] = signatureBytes;

        return signatureBytes;
      } catch (error) {
        console.error("Error in Smart Contract Wallet signMessage:", error);
        throw error;
      }
    },
    // Include getChainId for SCW compatibility
    getChainId: () => {
      console.log("SCW getChainId called, value:", chainId);
      return typeof chainId === "undefined"
        ? BigInt(1)
        : BigInt(chainId.toString());
    },
  };
};
