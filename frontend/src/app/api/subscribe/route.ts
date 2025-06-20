import { NextRequest, NextResponse } from "next/server";
import { transactSmartWallet } from "@/utils/smartSpender";
import { Address, createPublicClient, Hex, http, parseUnits } from "viem";
import prisma from "@/lib/prisma";
import { SpendPermission, SubscribeResponse } from "@/types";
import { Prisma } from "@/app/generated/prisma";
import { env } from "@/lib/env";
import {
  spendPermissionManagerAbi,
  spendPermissionManagerAddress,
} from "@/lib/abis/SpendPermissionManager";

export async function POST(req: NextRequest) {
  try {
    const {
      spendPermission,
      signature,
      agent,
    }: { spendPermission: SpendPermission; signature: Address; agent: string } =
      await req.json();

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

    if (!agent) {
      return NextResponse.json(
        {
          status: "failure",
          message: "Agent is required",
        },
        { status: 400 }
      );
    }

    const { success, transactionHash } = await transactSmartWallet(
      spendPermission,
      signature
    );
    await prisma.spendPermission.create({
      data: {
        account: spendPermission.account.toLocaleLowerCase(),
        spender: spendPermission.spender.toLocaleLowerCase(),
        token: spendPermission.token,
        allowance: spendPermission.allowance.toString(),
        period: spendPermission.period,
        start: new Date(spendPermission.start * 1000),
        end: new Date(spendPermission.end * 1000),
        salt: spendPermission.salt.toString(),
        extraData: spendPermission.extraData?.toString(),
        agent,
      },
    });
    const transactionUrl =
      process.env.NEXT_PUBLIC_NETWORK_ID === "mainnet"
        ? `https://basescan.org/tx/${transactionHash}`
        : `https://sepolia.basescan.org/tx/${transactionHash}`;
    return NextResponse.json(
      {
        status: success ? "success" : "failure",
        transactionHash: transactionHash,
        transactionUrl: transactionUrl,
      },
      { status: 200 }
    );
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

export async function GET(req: NextRequest) {
  try {
    const account = req.nextUrl.searchParams.get("account");
    const spender = req.nextUrl.searchParams.get("spender");
    const allowance = req.nextUrl.searchParams.get("allowance");
    const status = req.nextUrl.searchParams.get("status");
    const agent = req.nextUrl.searchParams.get("agent");

    const filters: Prisma.SpendPermissionWhereInput = {};
    if (account) filters.account = account.toLocaleLowerCase();
    if (spender) filters.spender = spender.toLocaleLowerCase();
    if (agent) filters.agent = agent;
    if (allowance) filters.allowance = allowance;
    if (status) filters.status = Number(status);
    console.log(filters);

    const spendPermissions = await prisma.spendPermission.findMany({
      where: filters,
    });

    const client = createPublicClient({
      chain: env.chain,
      transport: http(),
    });

    const contracts = spendPermissions.map((permission) => {
      return {
        abi: spendPermissionManagerAbi,
        functionName: "isValid",
        address: spendPermissionManagerAddress,
        args: [
          {
            account: permission.account,
            spender: permission.spender,
            token: permission.token,
            allowance: permission.allowance,
            period: permission.period,
            start: Math.floor(new Date(permission.start).getTime() / 1000),
            end: Math.floor(new Date(permission.end).getTime() / 1000),
            salt: permission.salt,
            extraData: permission.extraData,
          },
        ],
      };
    });

    const data = await client.multicall({
      contracts: contracts,
    });

    const validations = await Promise.all(
      data.map(async (value, index) => {
        const permission = spendPermissions[index];
        await prisma.spendPermission.update({
          where: {
            id: permission.id,
          },
          data: {
            status:
              value.status === "success" ? (Boolean(value.result) ? 1 : 0) : 0,
          },
        });
        return {
          spendPermission: permission,
          status:
            value.status === "success" ? (Boolean(value.result) ? 1 : 0) : 0,
          error: value.status === "failure" ? value.error : null,
        };
      })
    );

    // if (status === "1") {
    //   validations = validations.filter(({ status }) => status == 1);
    // }

    // if (status === "0") {
    //   validations = validations.filter(({ status }) => status == 0);
    // }

    const response: SubscribeResponse = {
      status: true,
      data: validations,
    };
    return NextResponse.json(response);
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { status: false, message: "An error occur, Try again" },
      { status: 500 }
    );
  }
}
