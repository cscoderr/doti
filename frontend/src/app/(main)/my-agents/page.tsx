"use client";
import { useState } from "react";
import AgentCard from "@/components/AgentCard";
import CreateAgentModal from "@/components/CreateAgentModal";
import { useRouter } from "next/navigation";
import { DotiAgent } from "@/types";
import CircularProgressBar from "@/components/CircularProgressBar";
import { env } from "@/lib/env";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  rating: number;
  users: number;
  price: {
    amount: number;
    period: string;
    chain: string;
  };
  icon: string;
  categories: string[];
  isDownloaded?: boolean;
}

export default function MyAgent() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "my-agents" | "subscription-agents"
  >("my-agents");

  const router = useRouter();
  const { address } = useAccount();
  const { data, isLoading } = useQuery({
    queryKey: ["fetchAgents", activeTab],
    queryFn: () => getAgents(activeTab),
  });

  async function getAgents(
    tab: "my-agents" | "subscription-agents"
  ): Promise<DotiAgent[]> {
    try {
      const endpoint =
        tab === "my-agents"
          ? `/api/user-agent/${address}`
          : `/api/agent/subscriptions/${address}`;
      const response = await fetch(`${env.backendUrl}${endpoint}`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Unable to get agents");
      }
      const json = await response.json();
      return json.data;
    } catch (e) {
      throw new Error(
        e instanceof Error ? e.message : "Something went wrong, Try again"
      );
    }
  }

  return (
    <>
      <div className="p-4 md:p-6 max-w-[2000px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">My Agents</h1>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("my-agents")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "my-agents"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            My Agents
          </button>
          <button
            onClick={() => setActiveTab("subscription-agents")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "subscription-agents"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Subscription Agents
          </button>
        </div>

        {(isLoading || !data) && <CircularProgressBar />}

        {/* Agents Grid */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {data.map((agent, index) => (
              <AgentCard
                key={index}
                agent={agent}
                onClick={() => router.push(`/marketplace/${agent.id}`)}
              />
            ))}
          </div>
        )}

        {/* No Results Message */}
        {data && data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-textDark/60 dark:text-textLight/60">
              No {activeTab === "my-agents" ? "My" : "Subscription"} Agents
              found.
            </p>
          </div>
        )}
      </div>
      <CreateAgentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
