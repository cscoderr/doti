"use client";
import { useState, useEffect, useCallback } from "react";

import { useAccount, useSignMessage } from "wagmi";
import { useXMTP } from "@/context/XmtpProvider";
import { mainnet } from "viem/chains";
import { hexToUint8Array } from "uint8array-extras";
import { env } from "@/lib/env";
import CircularProgressBar from "@/components/CircularProgressBar";
import { createSCWSigner } from "@/lib/xmtp-helper";
import { Signer } from "@xmtp/browser-sdk";
import AgentMessages from "@/components/AgentMessages";
import { DotiAgent } from "@/types";
import { useParams } from "next/navigation";
import BlockiesIcon from "@/components/BlockiesIcon";

const XMTP_CONNECTION_TYPE_KEY = "xmtp:connectionType";
const XMTP_INITIALIZING = "xmtp:initializing";
const XMTP_INIT_TIMESTAMP = "xmtp:initTimestamp";

export default function AgentChat() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { address } = useAccount();
  const { initializing, initialize, client } = useXMTP();
  const { signMessageAsync } = useSignMessage();
  const [loading, setLoading] = useState(false);
  const [localInitializing, setLocalInitializing] = useState(false);
  const [agent, setAgent] = useState<DotiAgent | null>(null);
  const params = useParams();
  const agentId = params.id as string;

  const startAgent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${env.backendUrl}/api/agent/${agentId}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const json = await response.json();
        console.log("Agents data is here", json);
        return;
      }
      console.log("Unable to create agent");
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  const getAgents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${env.backendUrl}/api/agent/${agentId}`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      });
      if (response.ok) {
        const json = await response.json();
        console.log("Agents data is here", json.data);
        setAgent(json.data);
        await startAgent();
        return;
      }
      console.log("Unable to create agent");
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, [agentId, startAgent]);

  const initializeXmtp = useCallback(
    async (signer: Signer) => {
      // Prevent duplicate initialization
      if (initializing || localInitializing) {
        console.log("XMTP initialization already in progress");
        return;
      }

      // Check for stale initialization flag
      const initTimestamp = sessionStorage.getItem(XMTP_INIT_TIMESTAMP);
      if (initTimestamp) {
        const now = Date.now();
        const elapsed = now - parseInt(initTimestamp, 10);

        // If it's been more than 30 seconds, clear the flag
        if (elapsed > 30000) {
          console.log("Clearing stale initialization flag");
          sessionStorage.removeItem(XMTP_INITIALIZING);
          sessionStorage.removeItem(XMTP_INIT_TIMESTAMP);
        } else if (sessionStorage.getItem(XMTP_INITIALIZING) === "true") {
          console.log("XMTP initialization flag active and recent");
          return;
        }
      }

      // Set initializing flags
      setLocalInitializing(true);
      sessionStorage.setItem(XMTP_INITIALIZING, "true");
      sessionStorage.setItem(XMTP_INIT_TIMESTAMP, Date.now().toString());

      try {
        console.log("Initializing XMTP with signer");

        await initialize({
          dbEncryptionKey: hexToUint8Array(env.encryptionKey),
          env: env.xmtpEnv,
          loggingLevel: "off",
          signer,
        });
      } catch (error) {
        console.error("Error initializing XMTP:", error);

        // If there was a signature error, clear stored connection type to prevent loops
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (error && (error as any).message?.includes("Signature")) {
          console.log(
            "Signature error detected, clearing connection type to prevent loops"
          );
          localStorage.removeItem(XMTP_CONNECTION_TYPE_KEY);
        }
      } finally {
        // Clear initializing flags
        sessionStorage.removeItem(XMTP_INITIALIZING);
        sessionStorage.removeItem(XMTP_INIT_TIMESTAMP);
        setLocalInitializing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialize, initializing]
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenu && !(event.target as Element).closest(".message-menu")) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenu]);

  useEffect(() => {
    setLoading(initializing);
  }, [initializing]);

  useEffect(() => {
    getAgents();
  }, []);

  useEffect(() => {
    initializeXmtp(
      createSCWSigner(
        address as `0x${string}`,
        signMessageAsync,
        BigInt(mainnet.id)
      )
    );
  }, [address, signMessageAsync, initializeXmtp]);

  if (loading || !agent) {
    return (
      <div className="flex flex-col h-[calc(100vh-5rem)]">
        <CircularProgressBar />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Chat Header */}
      <ChatHeader agent={agent} />

      {/* Messages Container */}
      {loading && <CircularProgressBar />}

      {/* Messages list */}
      {!loading && client && <AgentMessages agent={agent} />}

      {/* Input Container */}
    </div>
  );
}

const ChatHeader = ({ agent }: { agent: DotiAgent }) => {
  return (
    <div className="bg-background border-b border-neutral-200 dark:border-neutral-800 p-4">
      <div className="flex items-center gap-3">
        {/* <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
          <span className="text-textLight font-bold text-lg">D</span>
        </div> */}
        <BlockiesIcon size={10} address={`0x${agent.id}`} />
        <div>
          <h2 className="font-semibold">{agent.name}</h2>
          <p className="text-sm text-textDark/60 dark:text-textLight/60">
            Online
          </p>
        </div>
      </div>
    </div>
  );
};
