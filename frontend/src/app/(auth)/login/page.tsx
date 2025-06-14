"use client";

import { useAccount, useConnect } from "wagmi";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Sun, Moon } from "lucide-react";
import { env } from "@/lib/env";

export default function LoginPage() {
  const { isConnected, address } = useAccount();
  const { connectors, connect } = useConnect();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", String(newMode));
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", newMode);
      }
      return newMode;
    });
  };

  const createUser = useCallback(async () => {
    if (!address) return;
    try {
      const response = await fetch(`${env.backendUrl}/api/user`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ address }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("User data is here", data);
        return;
      }
      console.log("Unable to create user");
    } catch (e) {
      console.log(e);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected) {
      createUser();
      router.push("/");
    }
  }, [router, createUser, isConnected]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary/40 to-secondary/40">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 p-2 rounded-full hover-primary z-50"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <Sun size={20} className="text-accent" />
        ) : (
          <Moon size={20} className="text-primary" />
        )}
      </button>

      {/* Left Column - Feature Showcase */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-12 bg-background/95 backdrop-blur-sm">
        <div className="max-w-lg space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Welcome to DOTi
            </h1>
            <p className="text-xl text-secondary">
              Your AI Agent Platform on Base Network
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Secure Wallet Integration
                </h3>
                <p className="text-secondary">
                  Connect your preferred wallet to access the platform and
                  manage your AI agents securely.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  XMTP Messaging
                </h3>
                <p className="text-secondary">
                  Communicate with AI agents through secure, decentralized
                  messaging powered by XMTP protocol.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  AI-Powered Agents
                </h3>
                <p className="text-secondary">
                  Create and interact with AI agents powered by advanced
                  technology.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Base Network</h3>
                <p className="text-secondary">
                  Built on Base, a secure, low-cost, and developer-friendly L2
                  network.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-background/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-primary/10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">D</span>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  DOTi
                </span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome to DOTi
            </h1>
            <p className="text-secondary">Connect your wallet to get started</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col space-y-3">
              <div>
                <button
                  onClick={() => connect({ connector: connectors[0] })}
                  className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-opacity-90 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Connect Coinbase Smart Wallet</span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-secondary">
              <p>By connecting your wallet, you agree to our</p>
              <div className="flex justify-center space-x-2 mt-1">
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>
                <span>and</span>
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
