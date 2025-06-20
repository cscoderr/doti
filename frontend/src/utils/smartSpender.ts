import { Address, createPublicClient, Hex, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  BundlerClient,
  createBundlerClient,
  createPaymasterClient,
  toCoinbaseSmartAccount,
} from "viem/account-abstraction";
import { SpendPermission } from "@/types";
import {
  spendPermissionManagerAbi,
  spendPermissionManagerAddress,
} from "@/lib/abis/SpendPermissionManager";
import { env } from "@/lib/env";

// export async function getSpenderBundlerClient(): Promise<BundlerClient> {
//   const client = createPublicClient({
//     chain: env.chain,
//     transport: http(),
//   });

//   const spenderAccountOwner = privateKeyToAccount(`0x${env.privateKey}` as Hex);

//   const spenderAccount = await toCoinbaseSmartAccount({
//     client,
//     owners: [spenderAccountOwner],
//   });

//   const paymasterClient = createPaymasterClient({
//     transport: http(env.paymasterAndBundlerEndpoint),
//   });
//   console.log("Create paymaster client", paymasterClient);

//   const spenderBundlerClient = createBundlerClient({
//     account: spenderAccount,
//     client,
//     paymaster: paymasterClient,
//     transport: http(env.paymasterAndBundlerEndpoint),
//   });
//   console.log("Create spender bundler client", spenderBundlerClient);

//   return spenderBundlerClient;
// }

export async function getSpenderBundlerClient(): Promise<BundlerClient> {
  const client = createPublicClient({
    chain: env.chain,
    transport: http(),
  });

  const spenderAccountOwner = privateKeyToAccount(`0x${env.privateKey}` as Hex);

  const spenderAccount = await toCoinbaseSmartAccount({
    client,
    owners: [spenderAccountOwner],
  });

  const paymasterClient = createPaymasterClient({
    transport: http(env.paymasterAndBundlerEndpoint),
  });
  console.log("Create paymaster client", paymasterClient);

  const spenderBundlerClient = createBundlerClient({
    account: spenderAccount,
    client,
    paymaster: paymasterClient,
    transport: http(env.paymasterAndBundlerEndpoint),
  });
  console.log("Create spender bundler client", spenderBundlerClient);

  return spenderBundlerClient;
}

export async function transactSmartWallet(
  spendPermission: SpendPermission,
  signature: Address
) {
  const spenderBundlerClient = await getSpenderBundlerClient();
  const calls = [
    {
      abi: spendPermissionManagerAbi,
      functionName: "approveWithSignature",
      to: spendPermissionManagerAddress,
      args: [spendPermission, signature],
    },
  ];
  const userOpHash = await spenderBundlerClient.sendUserOperation({ calls });

  const userOpReceipt = await spenderBundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  return {
    success: userOpReceipt.success,
    transactionHash: userOpReceipt.receipt.transactionHash,
  };
}
