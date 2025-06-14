import { z } from "zod";
import { baseSepolia, base } from "wagmi/chains";
import type { Chain } from "wagmi/chains";

export const ENV = {
  url: process.env.NEXT_PUBLIC_URL,
  appEnv: process.env.NEXT_PUBLIC_APP_ENV,
  privateKey: process.env.NEXT_PUBLIC_PRIVATE_KEY,
  xmtpEnv: process.env.NEXT_PUBLIC_XMTP_ENV,
  appName: process.env.NEXT_PUBLIC_APP_NAME,
  networkID: process.env.NEXT_PUBLIC_NETWORK_ID,
  encryptionKey: process.env.NEXT_PUBLIC_ENCRYPTION_KEY,
  reownProjectID: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
  cdpApiKeyID: process.env.NEXT_PUBLIC_CDP_API_KEY_ID,
  cdpApiKey: process.env.NEXT_PUBLIC_CDP_API_KEY,
  cdpWalletOption: process.env.NEXT_PUBLIC_CDP_WALLET_OPTION,
  cdpApiKeySecret: process.env.NEXT_PUBLIC_CDP_API_KEY_SECRET,
  openApiKey: process.env.NEXT_PUBLIC_OPEN_AI_KEY,
  paymasterAndBundlerEndpoint:
    process.env.NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT,
  dotiBotAddress: process.env.NEXT_PUBLIC_DOTI_BOT_ADDRESS,
  defaultToken: process.env.NEXT_PUBLIC_DEFAULT_TOKEN,
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
  chain: process.env.NEXT_PUBLIC_NETWORK_ID === "mainnet" ? base : baseSepolia,
};

export const envSchema = z.object({
  url: z.string(),
  appEnv: z.string(),
  privateKey: z.string().min(1),
  xmtpEnv: z.custom<"local" | "dev" | "production">(
    (data) => data === "local" || data === "dev" || data === "production",
    {
      message: "xmtpEnv should be either local or dev or production",
    }
  ),
  appName: z.string().min(1),
  networkID: z.string().min(1),
  encryptionKey: z.string().min(1),
  reownProjectID: z.string().min(1),
  cdpApiKeyID: z.string().min(1),
  cdpApiKey: z.string().min(1),
  cdpWalletOption: z.string().min(1),
  cdpApiKeySecret: z.string().min(1),
  openApiKey: z.string().min(1),
  paymasterAndBundlerEndpoint: z.string().min(1),
  backendUrl: z.string().min(1),
  dotiBotAddress: z.string(),
  defaultToken: z.string(),
  chain: z.custom<Chain>((data) => data === baseSepolia || data === base, {
    message: "baseNetwork should be either base or baseSepolia",
  }),
});

export type Env = z.infer<typeof envSchema>;
const chain = ENV.networkID === "mainnet" ? base : baseSepolia;
export const env: Env = envSchema.parse({ ...ENV, chain });
