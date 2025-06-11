import { getRandomValues } from "node:crypto";
import { IdentifierKind, type Signer } from "@xmtp/node-sdk";
import { fromString, toString } from "uint8arrays";
import { createPublicClient, createWalletClient, http, toBytes } from "viem";
import { base, baseSepolia, sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { toCoinbaseSmartAccount } from "viem/account-abstraction";

interface User {
  key: `0x${string}`;
  account: ReturnType<typeof privateKeyToAccount>;
  wallet: ReturnType<typeof createWalletClient>;
}

export const createUser = (key: string): User => {
  const account = privateKeyToAccount(key as `0x${string}`);
  return {
    key: key as `0x${string}`,
    account,
    wallet: createWalletClient({
      account,
      chain: sepolia,
      transport: http(),
    }),
  };
};

export const createSigner = async (key: string): Promise<Signer> => {
  const sanitizedKey = (
    key.startsWith("0x") ? key : `0x${key}`
  ) as `0x${string}`;
  const chain = process.env.BASE_NETWORK == "mainnet" ? base : baseSepolia;
  console.log(chain.id);
  const publicClient = createPublicClient({
    chain: chain,
    transport: http(),
  });
  const account = await toCoinbaseSmartAccount({
    client: publicClient,
    owners: [privateKeyToAccount(sanitizedKey)],
  });
  return {
    //EOA
    type: "SCW",
    getIdentifier: () => ({
      identifierKind: IdentifierKind.Ethereum,
      identifier: account.address.toLowerCase(),
    }),
    signMessage: async (message: string) => {
      const signature = await account.signMessage({
        message,
      });
      return toBytes(signature);
    },
    getChainId: () => BigInt(chain.id),
  };
};

/**
 * Generate a random encryption key
 * @returns The encryption key
 */
export const generateEncryptionKeyHex = () => {
  /* Generate a random encryption key */
  const uint8Array = getRandomValues(new Uint8Array(32));
  /* Convert the encryption key to a hex string */
  return toString(uint8Array, "hex");
};

/**
 * Get the encryption key from a hex string
 * @param hex - The hex string
 * @returns The encryption key
 */
export const getEncryptionKeyFromHex = (hex: string) => {
  /* Convert the hex string to an encryption key */
  return fromString(hex, "hex");
};
