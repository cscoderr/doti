"use client";

import * as React from "react";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import {
  cookieStorage,
  createConfig,
  createStorage,
  http,
  injected,
  WagmiProvider,
} from "wagmi";
import { base, baseSepolia, mainnet } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors";

// const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";

// const { connectors } = getDefaultWallets({
//   appName: "Doti",
//   projectId: "7916b2268094beed78c5c3e1c8cc88a1",
// });

const wagmiConfig = createConfig({
  chains: [mainnet, base, baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: "Doti",
      preference: {
        options: "all",
      },
    }),
    walletConnect({
      projectId: "7916b2268094beed78c5c3e1c8cc88a1",
    }),
    injected({}),
    metaMask(),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [mainnet.id]: http(""),
    [base.id]: http(""),
    [baseSepolia.id]: http(""),
  },
  // connectors,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{mounted && children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
