"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import {
  Star,
  Users,
  MessageSquare,
  Download,
  CheckCircle2,
  CircleDollarSign,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  longDescription: string;
  interactions: number;
  rating: number;
  users: number;
  groups: number;
  price: {
    amount: number;
    period: string;
    chain: string;
  };
  icon: string;
  categories: string[];
  features: string[];
  isDownloaded?: boolean;
}

export default function AgentDetails() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agent, setAgent] = useState<Agent | null>(null);
  const params = useParams();
  const agentId = params.id as string;

  useEffect(() => {
    // In a real app, this would be an API call to fetch the agent details
    // For now, we'll create a dummy agent
    const dummyAgent: Agent = {
      id: agentId,
      name: `Agent ${agentId.split("-")[1]}`,
      type: "AI Assistant",
      description: "A powerful AI assistant for your needs",
      longDescription: `This is a comprehensive AI assistant designed to help you with various tasks. It combines advanced natural language processing with machine learning capabilities to provide intelligent and context-aware responses. The assistant can handle complex queries, maintain conversation context, and adapt to your specific needs.

Key capabilities include:
- Natural language understanding and generation
- Context-aware responses
- Multi-turn conversations
- Task automation
- Data analysis and visualization
- Custom knowledge base integration`,
      interactions: Math.floor(Math.random() * 1000) + 100,
      rating: Number((Math.random() * 2 + 3).toFixed(1)),
      users: Math.floor(Math.random() * 500) + 50,
      groups: Math.floor(Math.random() * 100) + 10,
      price: {
        amount: Number((Math.random() * 200 + 10).toFixed(2)),
        period: "monthly",
        chain: "USDC on Base",
      },
      icon: "🤖",
      categories: ["AI", "Assistant", "Productivity"],
      features: [
        "Natural Language Processing",
        "Context Awareness",
        "Multi-turn Conversations",
        "Task Automation",
        "Data Analysis",
        "Custom Knowledge Base",
        "API Integration",
        "Real-time Updates",
      ],
      isDownloaded: Math.random() > 0.7,
    };
    setAgent(dummyAgent);
  }, [agentId]);

  const handleDownload = () => {
    if (agent) {
      setAgent({ ...agent, isDownloaded: !agent.isDownloaded });
    }
  };

  if (!agent) {
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
          <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Agent Not Found</h2>
              <p className="text-textDark/60 dark:text-textLight/60">
                The agent you're looking for doesn't exist.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
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
          {/* Back Button */}
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Back to Marketplace</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Agent Header */}
              <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl md:text-5xl">{agent.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                          {agent.name}
                        </h1>
                        <p className="text-textDark/60 dark:text-textLight/60 mb-4">
                          {agent.type}
                        </p>
                      </div>
                      <button
                        onClick={handleDownload}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          agent.isDownloaded
                            ? "bg-accent/10 text-accent hover:bg-accent/20"
                            : "bg-primary text-textLight hover:bg-accent"
                        }`}
                      >
                        {agent.isDownloaded ? (
                          <>
                            <CheckCircle2 size={20} />
                            <span>Installed</span>
                          </>
                        ) : (
                          <>
                            <Download size={20} />
                            <span>Install</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {agent.categories.map((category, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                        >
                          {category}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="text-accent" size={18} />
                        <span className="font-medium">{agent.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={18} className="text-primary" />
                        <span>{agent.users} users</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={18} className="text-primary" />
                        <span>{agent.groups} groups</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Description</h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-line">{agent.longDescription}</p>
                </div>
              </div>

              {/* Features */}
              <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agent.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-3 rounded-lg bg-primary/5"
                    >
                      <CheckCircle2 size={18} className="text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="lg:col-span-1">
              <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Pricing</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-textDark/60 dark:text-textLight/60">
                      Price
                    </span>
                    <div className="flex items-center gap-1">
                      <CircleDollarSign size={18} className="text-accent" />
                      <span className="font-bold text-lg">
                        {agent.price.amount}
                      </span>
                      <span className="text-textDark/60 dark:text-textLight/60">
                        {agent.price.chain}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-textDark/60 dark:text-textLight/60">
                      Billing Period
                    </span>
                    <span className="font-medium capitalize">
                      {agent.price.period}
                    </span>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={handleDownload}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                        agent.isDownloaded
                          ? "bg-accent/10 text-accent hover:bg-accent/20"
                          : "bg-primary text-textLight hover:bg-accent"
                      }`}
                    >
                      {agent.isDownloaded ? (
                        <>
                          <CheckCircle2 size={20} />
                          <span>Installed</span>
                        </>
                      ) : (
                        <>
                          <Download size={20} />
                          <span>Install Agent</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
