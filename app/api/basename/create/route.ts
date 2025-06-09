import { NextRequest, NextResponse } from "next/server";
import { basenameActionProvider, ViemWalletProvider } from "@coinbase/agentkit";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { createWalletClient, http } from "viem";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, username, basename } = body;

    if (!username) {
      return NextResponse.json(
        { status: false, message: "Username is required" },
        { status: 400 }
      );
    }
    if (!address) {
      return NextResponse.json(
        {
          status: false,
          message: "Address, signature and message are required",
        },
        { status: 400 }
      );
    }
    console.log(basename);

    // if (!chainId) {
    //     return NextResponse.json({ message: 'Invalid message' }, { status: 400 });
    //   }

    //   if (chainId !== 1 && chainId !== 11155111) {
    //     return NextResponse.json({ message: 'Invalid chainId' }, { status: 400 });
    //   }
    const account = privateKeyToAccount(
      "0x4c0883a69102937d6231471b5dbb6208ffd70c02a813d7f2da1c54f2e3be9f38"
    );
    console.log(process.env.NEXT_PUBLIC_PRIVATE_KEY);

    const client = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(),
    });

    const walletProvider = new ViemWalletProvider(client);

    const actionProvider = basenameActionProvider();

    const response = await actionProvider.register(walletProvider, {
      amount: "0.0001",
      basename: basename,
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An error occur, Try again" },
      { status: 500 }
    );
  }
}
