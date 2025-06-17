import { createPublicClient, createWalletClient, Hex, http } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import {
    createBundlerClient,
    createPaymasterClient,
    toCoinbaseSmartAccount,
} from "viem/account-abstraction";
import { SpendPermission } from "@/types";
import {spendPermissionManagerAbi, spendPermissionManagerAddress} from "@/lib/abis/SpendPermissionManager";
import {env} from "@/lib/env";

export async function getSpenderBundlerClient(): Promise<any> {
    const client = createPublicClient({
        chain: env.chain,
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

export async function transactSmartWallet(
    spendPermission: SpendPermission,
    signature: any
) {
    //Math.floor(new Date(spendPermission.start).getTime() / 1000),
    const spenderBundlerClient = await getSpenderBundlerClient();
    const calls = [
        {
            abi: spendPermissionManagerAbi,
            functionName: "approveWithSignature",
            to: spendPermissionManagerAddress,
            args: [spendPermission, signature],
        }
    ];
    const userOpHash = await spenderBundlerClient.sendUserOperation({calls});

    const userOpReceipt = await spenderBundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
    });

    return {
        success: userOpReceipt.success,
        transactionHash: userOpReceipt.receipt.transactionHash,
    };
}
