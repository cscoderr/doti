"use client";

import * as React from "react";
import {
  cookieStorage,
  createConfig,
  createStorage,
  http,
  State,
  WagmiProvider,
} from "wagmi";
import { base, baseSepolia, mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { coinbaseWallet } from "wagmi/connectors";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { XMTPProvider } from "@/context/XmtpProvider";
import { env } from "@/lib/env";

export const cbWalletConnector = coinbaseWallet({
  appName: "Doti",
  preference: {
    options: "smartWalletOnly",
  },
});

export const wagmiConfig = createConfig({
  chains: [mainnet, base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [mainnet.id]: http(),
  },
  connectors: [cbWalletConnector],
  storage: createStorage({
    storage: cookieStorage,
  }),
});
const queryClient = new QueryClient();

export function Providers({
  initialState,
  children,
}: {
  initialState?: State;
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={env.cdpApiKey}
          chain={env.chain}
          config={{
            appearance: {
              mode: "auto",
              theme: "base",
            },
          }}
        >
          <XMTPProvider>{children}</XMTPProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
