import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, encodeFunctionData, http, namehash } from "viem";
import { baseSepolia } from "viem/chains";
import {
  createBundlerClient,
  createPaymasterClient,
  toCoinbaseSmartAccount,
} from "viem/account-abstraction";
import { ViemWalletProvider } from "@coinbase/agentkit";

// Relevant ABI for L2 Resolver Contract.
const l2ResolverABI = [
  {
    inputs: [
      { internalType: "bytes32", name: "node", type: "bytes32" },
      { internalType: "address", name: "a", type: "address" },
    ],
    name: "setAddr",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "node", type: "bytes32" },
      { internalType: "string", name: "newName", type: "string" },
    ],
    name: "setName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Relevant ABI for Basenames Registrar Controller Contract.
const registrarABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "duration",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "resolver",
            type: "address",
          },
          {
            internalType: "bytes[]",
            name: "data",
            type: "bytes[]",
          },
          {
            internalType: "bool",
            name: "reverseRecord",
            type: "bool",
          },
        ],
        internalType: "struct RegistrarController.RegisterRequest",
        name: "request",
        type: "tuple",
      },
    ],
    name: "register",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

// Network-specific contract addresses
const NEXT_NETWORK_ID = process.env.NEXT_NETWORK_ID || "base-sepolia";

let BaseNamesRegistrarControllerAddress: string;
let L2ResolverAddress: string;

if (NEXT_NETWORK_ID === "base-mainnet") {
  BaseNamesRegistrarControllerAddress =
    "0x4cCb0BB02FCABA27e82a56646E81d8c5bC4119a5";
  L2ResolverAddress = "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD";
} else {
  // Default to Base Sepolia addresses
  BaseNamesRegistrarControllerAddress =
    "0x49aE3cC2e3AA768B1e5654f5D3C6002144A59581";
  L2ResolverAddress = "0x6533C94869D28fAA8dF77cc63f9e2b2D6Cf77eBA";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, basename } = body;

    if (!address) {
      return NextResponse.json(
        {
          status: false,
          message: "Address is required",
        },
        { status: 400 }
      );
    }
    if (!basename) {
      return NextResponse.json(
        {
          status: false,
          message: "Basename is required",
        },
        { status: 400 }
      );
    }

    const registerArgs = createRegisterContractMethodArgs(basename, address);

    const contractInvocation = await registerBaseName(
      address,
      basename,
      registerArgs
    );

    // const actionProvider = basenameActionProvider();
    // const isMainnet = process.env.NETWORK_ID === "mainnet";
    // const networkId = isMainnet ? base.name : baseSepolia.name;

    // console.log("Configuring wallet with:", {
    //   networkId,
    //   address,
    //   isMainnet,
    // });

    // const walletProvider = await CdpWalletProvider.configureWithWallet({
    //   apiKeyId: process.env.CDP_API_KEY_ID,
    //   apiKeySecret: process.env.CDP_API_KEY_SECRET,
    //   networkId: networkId,
    //   address: address,
    // });

    // const publicClient = createPublicClient({
    //   chain: baseSepolia,
    //   transport: http(),
    // });
    // const account = await toCoinbaseSmartAccount({
    //   client: publicClient,
    //   owners: [address],
    // });
    // const walletProvider2 = new ViemWalletProvider(account.client);

    // const response = await actionProvider.register(walletProvider, {
    //   amount: "0.001",
    //   basename: username,
    // });

    // if (
    //   typeof response === "string" &&
    //   response.toLowerCase().includes("error")
    // ) {
    //   console.error("Registration failed:", response);
    //   return NextResponse.json(
    //     { status: false, message: "Unable to register username, Try again" },
    //     { status: 400 }
    //   );
    // }

    return NextResponse.json({}, { status: 201 });
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

// Create register contract method arguments.
function createRegisterContractMethodArgs(
  basename: string,
  address: string
): object {
  const addressData = encodeFunctionData({
    abi: l2ResolverABI,
    functionName: "setAddr",
    args: [namehash(basename), address],
  });
  const nameData = encodeFunctionData({
    abi: l2ResolverABI,
    functionName: "setName",
    args: [namehash(basename), basename],
  });

  const registerArgs = {
    name: basename.replace(/\.basetest\.eth$/, ""),
    owner: address,
    duration: "31557600",
    resolver: L2ResolverAddress,
    data: [addressData, nameData],
    reverseRecord: true,
  };
  console.log(`Register contract method arguments constructed: `, registerArgs);

  return registerArgs;
}

// Registers a Basename.
async function registerBaseName(
  walletAddress: `0x${string}`,
  basename: string,
  registerArgs: object
): Promise<any> {
  try {
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const account = await toCoinbaseSmartAccount({
      client: publicClient,
      owners: [walletAddress],
    });
    console.log(await account.client.account?.address);
    console.log(await account.client.account?.type);
    console.log(await account.address);
    console.log(await account.type);

    const data = [
      {
        abi: registrarABI,
        functionName: "register",
        to: BaseNamesRegistrarControllerAddress as `0x${string}`,
        args: [registerArgs],
      },
    ];

    const paymasterClient = createPaymasterClient({
      transport: http(process.env.PAYMASTER_AND_BUNDLER_ENDPOINT),
    });
    //0x5c63d9Dfd2DA93c3a89204979e367eA06c61D3FA

    const bundlerClient = createBundlerClient({
      account: account,
      client: publicClient,
      paymaster: paymasterClient,
      transport: http(process.env.PAYMASTER_AND_BUNDLER_ENDPOINT),
    });

    const txHash = await bundlerClient.sendUserOperation({
      calls: data,
    });
    const receipt = await bundlerClient.waitForUserOperationReceipt({
      hash: txHash,
    });

    console.log(receipt.receipt.transactionHash);

    // console.log(
    //   `Successfully registered Basename ${registerArgs.name} for wallet: `,
    //   walletAddress
    // );

    // return userOpReceipt.receipt.transactionHash;
  } catch (error) {
    console.error(
      // `Error registering a Basename for ${walletAddress.getId()}: `,
      `Error registering a Basename for ${walletAddress}: `,
      error
    );
    throw error;
  }
}
