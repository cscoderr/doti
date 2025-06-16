"use client";
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import CreateAgentModal from "@/components/CreateAgentModal";
import { useRouter } from "next/navigation";
import { DotiAgent } from "@/types";
import CircularProgressBar from "@/components/CircularProgressBar";
import { env } from "@/lib/env";
import { useQuery } from "@tanstack/react-query";
import { base } from "viem/chains";

export default function MarketPlace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["fetchAgents"],
    queryFn: getAgents,
    refetchOnWindowFocus: true,
    refetchInterval: 50000,
  });

  async function getAgents(): Promise<DotiAgent[]> {
    try {
      const response = await fetch(`${env.backendUrl}/api/agent`, {
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

  if (isLoading || !data) {
    return <CircularProgressBar />;
  }

  return (
    <>
      <div className="p-4 md:p-6 max-w-[2000px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Doti Agents</h1>
          <button
            onClick={() => router.push("/marketplace/create")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-textLight rounded-lg hover:bg-accent transition-colors"
          >
            <Plus size={20} />
            <span>Create Doti App</span>
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textDark/60"
                size={20}
              />
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {data.map((agent, index) => (
            <AgentCard
              key={index}
              agent={agent}
              onClick={() => router.push(`/marketplace/${agent.id}`)}
            />
          ))}
        </div>

        {/* No Results Message */}
        {data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-textDark/60 dark:text-textLight/60">
              No Agent found.
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
