import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";
import { base, baseSepolia, mainnet } from "wagmi/chains";

export const wagmiConfig = () => {
  return createConfig({
    chains: [mainnet, base, baseSepolia],
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http(),
      [mainnet.id]: http(),
    },
    connectors: [
      coinbaseWallet({
        appName: "Doti",
        preference: {
          options: "smartWalletOnly",
        },
      }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
  });
};
