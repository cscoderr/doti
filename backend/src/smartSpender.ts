import { createPublicClient, createWalletClient, Hex, http } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import {
  createBundlerClient,
  createPaymasterClient,
  toCoinbaseSmartAccount,
} from "viem/account-abstraction";

export async function getSpenderBundlerClient(): Promise<any> {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const spenderAccountOwner = privateKeyToAccount(
    process.env.WALLET_KEY! as Hex
  );

  const spenderAccount = await toCoinbaseSmartAccount({
    client,
    owners: [spenderAccountOwner],
  });
  console.log({ spenderAccount });
  const paymasterClient = createPaymasterClient({
    transport: http(process.env.PAYMASTER_AND_BUNDLER_ENDPOINT),
  });

  const spenderBundlerClient = createBundlerClient({
    account: spenderAccount,
    client,
    paymaster: paymasterClient,
    transport: http(process.env.PAYMASTER_AND_BUNDLER_ENDPOINT),
  });

  return spenderBundlerClient;
}
