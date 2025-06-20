import { createPublicClient, Hex, http, parseUnits } from "viem";
import { base, baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import {
  createBundlerClient,
  createPaymasterClient,
  toCoinbaseSmartAccount,
} from "viem/account-abstraction";
import { SpendPermissionResponse } from "./types/SpendPermission";
import {
  spendPermissionManagerAbi,
  spendPermissionManagerAddress,
} from "./abis/SpendPermissionManager";

export async function getSpenderBundlerClient(): Promise<any> {
  const client = createPublicClient({
    chain: base,
    transport: http(),
  });

  const spenderAccountOwner = privateKeyToAccount(
    `0x${process.env.WALLET_KEY!}` as Hex
  );

  const spenderAccount = await toCoinbaseSmartAccount({
    client,
    owners: [spenderAccountOwner],
  });
  const paymasterClient = createPaymasterClient({
    transport: http(process.env.PAYMASTER_AND_BUNDLER_ENDPOINT),
  });

  const spenderBundlerClient = createBundlerClient({
    account: spenderAccount,
    client,
    paymaster: paymasterClient,
    transport: http(process.env.PAYMASTER_AND_BUNDLER_ENDPOINT),
  });

  console.log("EOA address:", spenderAccountOwner.address);
  console.log("SCW address:", spenderAccount.address);

  return spenderBundlerClient;
}

export async function chargeUser(
  spendPermission: SpendPermissionResponse,
  fees: number
) {
  const spenderBundlerClient = await getSpenderBundlerClient();
  const calls = [
    {
      abi: spendPermissionManagerAbi,
      functionName: "spend",
      to: spendPermissionManagerAddress,
      args: [
        {
          account: spendPermission.account as `0x${string}`,
          spender: spendPermission.spender as `0x${string}`,
          allowance: BigInt(spendPermission.allowance),
          salt: BigInt(spendPermission.salt),
          token: spendPermission.token as `0x${string}`,
          period: spendPermission.period,
          start: Math.floor(new Date(spendPermission.start).getTime() / 1000),
          end: Math.floor(new Date(spendPermission.end).getTime() / 1000),
          extraData: spendPermission.extraData as `0x${string}`,
        },
        parseUnits(fees.toString(), 6),
      ],
    },
  ];

  const userOpHash = await spenderBundlerClient.sendUserOperation({ calls });

  const userOpReceipt = await spenderBundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  console.log("Transaction Hash", userOpReceipt.receipt.transactionHash);

  return userOpReceipt.receipt.transactionHash;
}
