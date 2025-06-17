import { NextRequest, NextResponse } from "next/server";
import { transactSmartWallet } from "@/utils/smartSpender";
import { Address, Hex, parseUnits } from "viem";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { spendPermission, signature } = await req.json();

    if (!spendPermission) {
      return NextResponse.json(
        {
          status: "failure",
          message: "Spend permission is required",
        },
        { status: 400 }
      );
    }

    if (!signature) {
      return NextResponse.json(
        {
          status: "failure",
          message: "Signature is required",
        },
        { status: 400 }
      );
    }

    // const { success, transactionHash } = await transactSmartWallet(
    //   spendPermission,
    //   signature
    // );
    await saveSpendPermissionToDB(spendPermission);
    return NextResponse.json(
      { status: true, message: "Success" },
      { status: 200 }
    );
    // const transactionUrl =
    //   process.env.NEXT_PUBLIC_NETWORK_ID === "mainnet"
    //     ? `https://basescan.org/tx/${transactionHash}`
    //     : `https://sepolia.basescan.org/tx/${transactionHash}`;
    // return NextResponse.json(
    //   {
    //     status: success ? "success" : "failure",
    //     transactionHash: transactionHash,
    //     transactionUrl: transactionUrl,
    //   },
    //   { status: 200 }
    // );
  } catch (error) {
    console.log(error);

    if (error instanceof Error) {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { status: false, message: "An error occur, Try again" },
      { status: 500 }
    );
  }
}

const saveSpendPermissionToDB = async (spendPermission: any) => {
  const permission = await prisma.spendPermission.create({
    data: {
      account: spendPermission.account,
      spender: spendPermission.spender,
      token: spendPermission.token,
      allowance: spendPermission.allowance,
      period: spendPermission.period,
      start: spendPermission.start,
      salt: spendPermission.salt,
      extraData: spendPermission.extraData,
    },
  });
  console.log(permission);
};
