import express, { type Request, type Response } from "express";
import { z } from "zod";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import { Client } from "@xmtp/node-sdk";
import {
  ensureLocalStorage,
  initializeXmtpClient,
  processMessage,
  startMessageListener,
} from "./xmtp-helper";
import { DotiAgentService } from "./doti.agent";
import { getSpenderBundlerClient } from "./smartSpender";
import {
  spendPermissionManagerAbi,
  spendPermissionManagerAddress,
} from "./abis/SpendPermissionManager";
import { SpendPermission } from "./types/SpendPermission";

let xmtpClient: Client;
let dotiAgent: DotiAgentService;

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Add global request logger
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get("/ping", (req, res) => {
  console.log("✅ PING");
  res.json({ status: "ok" });
});

const userSchema = z.object({
  address: z.string(),
});

app.post("/api/user", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const parsed = userSchema.parse(body);
    const user = await dotiAgent.createUser(parsed.address);
    res.json({ status: true, message: "User created", data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        status: false,
        message: error.message,
        errors: error.issues,
      });
      return;
    }
    if (error instanceof Error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      status: false,
      message: "An error occurred, Try again",
    });
  }
});

const agentSchema = z.object({
  ownerAddress: z.string(),
  name: z.string(),
  description: z.string(),
  prompt: z.string(),
  isPublic: z.boolean().optional(),
});
app.post("/api/agent", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const parsed = agentSchema.parse(body);
    const agent = await dotiAgent.createAndStartAgent(
      parsed.ownerAddress,
      parsed.name,
      parsed.description,
      parsed.prompt,
      parsed.isPublic || false
    );
    res.json({
      status: true,
      data: {
        ...agent,
        isRunning: true,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        status: false,
        message: error.message,
        errors: error.issues,
      });
      return;
    }
    if (error instanceof Error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      status: false,
      message: "An error occurred, Try again",
    });
  }
});

app.get("/api/agent", async (req: Request, res: Response) => {
  try {
    const agent = await dotiAgent.getAgents();
    res.json({
      status: true,
      data: agent,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      status: false,
      message: "An error occurred, Try again",
    });
  }
});

app.get("/api/user-agent/:address", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const agent = await dotiAgent.getAvailableAgents(address);
    res.json({
      status: true,
      data: agent,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      status: false,
      message: "An error occurred, Try again",
    });
  }
});

app.post("/api/agent/:agentId", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    await dotiAgent.ensureAgentRunning(agentId);

    res.status(200).json({
      success: true,
      message: "Agent started successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      status: false,
      message: "An error occurred, Try again",
    });
  }
});

app.get("/api/agent/:agentId", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const data = await dotiAgent.getAgentStatus(agentId);
    res.json({
      status: true,
      data: data.agent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        status: false,
        message: error.message,
        errors: error.issues,
      });
      return;
    }
    if (error instanceof Error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      status: false,
      message: "An error occurred, Try again",
    });
  }
});

async function transactSmartWallet(
  spendPermission: SpendPermission,
  signature: any
) {
  //Math.floor(new Date(spendPermission.start).getTime() / 1000),
  const spenderBundlerClient = await getSpenderBundlerClient();
  const userOpHash = await spenderBundlerClient.sendUserOperation({
    calls: [
      {
        abi: spendPermissionManagerAbi,
        functionName: "approveWithSignature",
        to: spendPermissionManagerAddress,
        args: [spendPermission, signature],
      },
      {
        abi: spendPermissionManagerAbi,
        functionName: "spend",
        to: spendPermissionManagerAddress,
        args: [spendPermission, BigInt(1)], // spend 1 wei
      },
    ],
  });

  const userOpReceipt = await spenderBundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  return {
    success: userOpReceipt.success,
    transactionHash: userOpReceipt.receipt.transactionHash,
  };
}

app.post("/api/collect", async (req: Request, res: Response) => {
  try {
    const { spendPermission, signature } = req.body;

    const { success, transactionHash } = await transactSmartWallet(
      spendPermission,
      signature
    );
    res.json({
      status: success ? "success" : "failure",
      transactionHash: transactionHash,
      transactionUrl: `https://sepolia.basescan.org/tx/${transactionHash}`,
    });
  } catch (e) {
    res.status(500).json({
      status: false,
      message: "An error occurred, Try again",
    });
  }
});

const PORT = process.env.PORT || 5000;
// Start Server
void (async () => {
  try {
    ensureLocalStorage();
    xmtpClient = await initializeXmtpClient();

    dotiAgent = new DotiAgentService();

    app.listen(PORT, async () => {
      console.log(`Server is running on port ${PORT}`);
      await startMessageListener(xmtpClient);
    });
  } catch (error) {
    console.error("Failed to initialize", error);
    process.exit(1);
  }
})();
