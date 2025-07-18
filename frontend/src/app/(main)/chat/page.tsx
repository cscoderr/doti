"use client";
import { useState, useEffect, useCallback } from "react";

import { useAccount, useSignMessage } from "wagmi";
import { useXMTP } from "@/context/XmtpProvider";
import { mainnet } from "viem/chains";
import { hexToUint8Array } from "uint8array-extras";
import { env } from "@/lib/env";
import Messages from "@/components/Messages";
import CircularProgressBar from "@/components/CircularProgressBar";
import { createSCWSigner } from "@/lib/xmtp-helper";
import { Signer } from "@xmtp/browser-sdk";

const XMTP_CONNECTION_TYPE_KEY = "xmtp:connectionType";
const XMTP_INITIALIZING = "xmtp:initializing";
const XMTP_INIT_TIMESTAMP = "xmtp:initTimestamp";

export default function Chat() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { address } = useAccount();
  const { initializing, initialize, client } = useXMTP();
  const { signMessageAsync } = useSignMessage();
  const [loading, setLoading] = useState(false);
  const [localInitializing, setLocalInitializing] = useState(false);

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
    initializeXmtp(
      createSCWSigner(
        address as `0x${string}`,
        signMessageAsync,
        BigInt(mainnet.id)
      )
    );
  }, [address, signMessageAsync, initializeXmtp]);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Chat Header */}
      <ChatHeader />

      {/* Messages Container */}
      {loading && <CircularProgressBar />}

      {/* Messages list */}
      {!loading && client && <Messages />}

      {/* Input Container */}
    </div>
  );
}

const ChatHeader = () => {
  return (
    <div className="bg-background border-b border-neutral-200 dark:border-neutral-800 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
          <span className="text-textLight font-bold text-lg">D</span>
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">DOTI Assistant</h2>
          <p className="text-sm text-textDark/100 dark:text-textLight/100 mt-1 line-clamp-2">
            Your AI-powered web3 personal assistant that helps you stay informed
            and interact with the crypto world using the Coinbase Developer
            Platform. I can help you check wallet balances, provide token
            information, share crypto news, and guide you through best practices
            in the web3 space.
          </p>
        </div>
      </div>
    </div>
  );
};
