// import {
//   useContext,
//   createContext,
//   useState,
//   useMemo,
//   useCallback,
//   PropsWithChildren,
// } from "react";
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
// import { env } from "@/lib/env";
// import { dotiAgentPrompt } from "@/lib/prompt";

// // interface AgentConfig {
// //   configurable: {
// //     thread_id: string;
// //   };
// // }

// export type Agent = ReturnType<typeof createReactAgent>;

// export type InitializeClientOptions = {
//   userId: string;
// };

// export type DotiAgentContextType = {
//   agent?: Agent;
//   setAgent: React.Dispatch<React.SetStateAction<Agent | undefined>>;
//   initialize: (options?: InitializeClientOptions) => Promise<Agent | undefined>;
//   initializing: boolean;
//   error: Error | null;
//   //   disconnect: () => void;
// };

// const DotiAgentContext = createContext<DotiAgentContextType>({
//   setAgent: () => {},
//   initialize: () => Promise.reject(new Error("XMTPProvider not available")),
//   initializing: false,
//   error: null,
// });

// export const DotiAgentProvider = ({ children }: PropsWithChildren) => {
//   const [agent, setAgent] = useState<Agent | undefined>();
//   const [walletData, setWalletData] = useState<string | undefined>();
//   const [error, setError] = useState<Error | null>(null);
//   const [initializing, setInitializing] = useState(false);

//   // Create context value
//   const value = useMemo<DotiAgentContextType>(
//     () => ({ initialize, initializing, setAgent, agent, error }),
//     [initialize, initializing, setAgent, agent, error]
//   );
//   return (
//     <DotiAgentContext.Provider value={value}>
//       {children}
//     </DotiAgentContext.Provider>
//   );
// };

// export const useDotiAgent = () => useContext(DotiAgentContext);
