"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import { Users, MessageSquare, TrendingUp } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Agent } from "./(main)/marketplace/page";
import { dotiCategories } from "@/utils/categories";
import {
  BasenameTextRecordKeys,
  getBasename,
  getBasenameAvatar,
  getBasenameTextRecord,
} from "./api/basename/newroute";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [popularAgents, setPopularAgents] = useState<Agent[]>([]);
  const [hasClaimedBasename, setHasClaimedBasename] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { isDisconnected, address } = useAccount();

  useEffect(() => {
    const dummyAgents: Agent[] = Array.from({ length: 6 }, (_, index) => ({
      id: `agent-${index + 1}`,
      name: `Agent ${String.fromCharCode(65 + (index % 26))}${
        Math.floor(index / 26) + 1
      }`,
      type: [
        "Customer Service",
        "Sales",
        "Support",
        "Analytics",
        "Content",
        "Meeting",
        "Research",
        "Education",
        "Development",
        "Management",
      ][index % 10],
      description: `This is a description for Agent ${
        index + 1
      }. It provides various services and capabilities to help users achieve their goals.`,
      rating: Number((Math.random() * 2 + 3).toFixed(1)),
      users: Math.floor(Math.random() * 500) + 50,
      interactions: Math.floor(Math.random() * 1000) + 100,
      price: {
        amount: Number((Math.random() * 200 + 10).toFixed(2)),
        period: ["monthly", "yearly", "per message"][index % 3],
        chain: "USDC",
      },
      icon: ["🤖", "💼", "🛠️", "📊", "✍️", "🎥", "🔍", "📚", "💻", "📋"][
        index % 10
      ],
      categories: Array.from(
        { length: 3 },
        () => dotiCategories[Math.floor(Math.random() * dotiCategories.length)]
      ),
      isDownloaded: Math.random() > 0.7,
    }));
    setPopularAgents(dummyAgents);
  }, []);

  const handleClaimBasename = useCallback(async () => {
    setHasClaimedBasename(false);
    try {
      setLoading(true);
      if (!address) return;
      const payload = {
        basename: username,
        address,
      };
      const response = await fetch("http://localhost:3000/api/basename", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      console.log(response);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, [username, address]);

  const handleFetchBasename = async () => {
    const basename = await getBasename(
      "0x5Dba4C1Db55c64bBB0260B9F48fE7009A07AaD71" as `0x${string}`
    );
    if (basename === undefined)
      throw Error("failed to resolve address to name");

    const avatar = await getBasenameAvatar(basename);
    const description = await getBasenameTextRecord(
      basename,
      BasenameTextRecordKeys.Description
    );

    return {
      basename,
      avatar,
      description,
    };
  };

  // useEffect(() => {
  //   handleFetchBasename().then((data) => {
  //     console.log(data);
  //   });
  // }, []);

  const stats = [
    {
      title: "Active Agents",
      value: "24",
      change: "+12%",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "Group Chats",
      value: "156",
      change: "+8%",
      icon: <MessageSquare className="w-6 h-6" />,
    },
    {
      title: "Total Interactions",
      value: "1,234",
      change: "+15%",
      icon: <TrendingUp className="w-6 h-6" />,
    },
  ];

  if (isDisconnected) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SideBar isOpen={sidebarOpen} />
      <Header
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main
        className={`pt-20 pb-20 md:pb-0 transition-all duration-200 ${
          sidebarOpen ? "md:ml-56" : "md:ml-16"
        }`}
      >
        <div className="p-4 md:p-6 max-w-[2000px] mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 md:p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-textDark/60 dark:text-textLight/60">
                      {stat.title}
                    </p>
                    <h3 className="text-xl md:text-2xl font-bold mt-1">
                      {stat.value}
                    </h3>
                  </div>
                  <div className="p-2 md:p-3 rounded-full bg-primary/10 text-primary">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-sm text-accent mt-4 flex items-center">
                  {stat.change}
                  <span className="ml-1">from last month</span>
                </p>
              </div>
            ))}
          </div>

          {/* Basename Claiming Section */}
          {!hasClaimedBasename && (
            <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 md:p-6 shadow-sm mb-8">
              <h2 className="text-lg md:text-xl font-bold mb-4">
                Claim Your Basename
              </h2>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-sm text-textDark/60 dark:text-textLight/60 mt-2">
                    Your basename will be:{" "}
                    {username
                      ? `${username}.basetest.eth`
                      : "username.basetest.eth"}
                  </p>
                </div>
                <button
                  onClick={handleClaimBasename}
                  disabled={!username || username.length < 3}
                  className="px-6 py-2 bg-primary self-start  text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div role="status">
                      <svg
                        aria-hidden="true"
                        className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-secondary"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                      <span className="sr-only">Loading...</span>
                    </div>
                  ) : (
                    "Claim Basename"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Popular Agents Section */}
          <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 md:p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">
              Popular Agents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {popularAgents.map((agent, index) => (
                <AgentCard
                  key={index}
                  {...agent}
                  onClick={() => router.push(`/explore/${agent.id}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
