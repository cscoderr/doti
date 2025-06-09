"use client";

import { useState } from "react";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import { Users, MessageSquare, DollarSign, TrendingUp } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const { isDisconnected, address } = useAccount();

  // Mock data for demonstration
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
      title: "Monthly Revenue",
      value: "$12,450",
      change: "+23%",
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      title: "Total Interactions",
      value: "1,234",
      change: "+15%",
      icon: <TrendingUp className="w-6 h-6" />,
    },
  ];

  const popularAgents = [
    {
      id: "alpha-assistant",
      name: "Alpha Assistant",
      type: "Customer Service",
      description:
        "AI-powered customer service agent that handles inquiries 24/7 with natural language understanding.",
      interactions: 234,
      rating: 4.8,
      users: 156,
      price: {
        amount: 29.99,
        period: "monthly",
        chain: "USDC on Base",
      },
      icon: "🤖",
      categories: ["Customer Support", "24/7 Service", "NLP"],
    },
    {
      id: "beta-bot",
      name: "Beta Bot",
      type: "Sales",
      description:
        "Intelligent sales assistant that qualifies leads and handles initial customer interactions.",
      interactions: 189,
      rating: 4.6,
      users: 98,
      price: {
        amount: 0.5,
        period: "per message",
        chain: "USDC on Base",
      },
      icon: "💼",
      categories: ["Sales", "Lead Generation", "CRM"],
    },
    {
      id: "gamma-guide",
      name: "Gamma Guide",
      type: "Support",
      description:
        "Technical support agent that helps users troubleshoot and resolve common issues.",
      interactions: 156,
      rating: 4.9,
      users: 203,
      price: {
        amount: 199.99,
        period: "yearly",
        chain: "USDC on Base",
      },
      icon: "🛠️",
      categories: ["Technical Support", "Troubleshooting", "Help Desk"],
    },
    {
      name: "Delta Data",
      type: "Analytics",
      description:
        "Data analysis agent that processes and visualizes complex datasets in real-time.",
      interactions: 312,
      rating: 4.7,
      users: 178,
      price: {
        amount: 49.99,
        period: "weekly",
      },
      icon: "📊",
      categories: ["Data Analysis", "Visualization", "Real-time"],
    },
    {
      name: "Epsilon Editor",
      type: "Content",
      description:
        "Content creation and editing assistant that helps with writing and proofreading.",
      interactions: 445,
      rating: 4.9,
      users: 289,
      price: {
        amount: 0.25,
        period: "per message",
      },
      icon: "✍️",
      categories: ["Content Creation", "Editing", "Proofreading"],
    },
    {
      name: "Zeta Zoom",
      type: "Meeting",
      description:
        "Virtual meeting assistant that handles scheduling, notes, and follow-ups.",
      interactions: 278,
      rating: 4.8,
      users: 167,
      price: {
        amount: 39.99,
        period: "monthly",
      },
      icon: "🎥",
      categories: ["Meetings", "Scheduling", "Notes"],
    },
    {
      name: "Eta Expert",
      type: "Research",
      description:
        "Research assistant that helps gather and analyze information from various sources.",
      interactions: 334,
      rating: 4.7,
      users: 198,
      price: {
        amount: 0.75,
        period: "per message",
      },
      icon: "🔍",
      categories: ["Research", "Analysis", "Information"],
    },
    {
      name: "Theta Tutor",
      type: "Education",
      description:
        "Educational assistant that provides personalized learning experiences.",
      interactions: 567,
      rating: 4.9,
      users: 345,
      price: {
        amount: 79.99,
        period: "monthly",
      },
      icon: "📚",
      categories: ["Education", "Learning", "Tutoring"],
    },
    {
      name: "Iota Innovator",
      type: "Development",
      description:
        "Coding assistant that helps with development tasks and debugging.",
      interactions: 423,
      rating: 4.8,
      users: 256,
      price: {
        amount: 0.5,
        period: "per message",
      },
      icon: "💻",
      categories: ["Development", "Coding", "Debugging"],
    },
    {
      name: "Kappa Keeper",
      type: "Project Management",
      description:
        "Project management assistant that helps track tasks and deadlines.",
      interactions: 289,
      rating: 4.7,
      users: 178,
      price: {
        amount: 59.99,
        period: "monthly",
      },
      icon: "📋",
      categories: ["Project Management", "Task Tracking", "Deadlines"],
    },
    {
      name: "Lambda Legal",
      type: "Legal",
      description:
        "Legal assistant that helps with document review and legal research.",
      interactions: 198,
      rating: 4.8,
      users: 145,
      price: {
        amount: 149.99,
        period: "monthly",
      },
      icon: "⚖️",
      categories: ["Legal", "Document Review", "Research"],
    },
    {
      name: "Mu Manager",
      type: "HR",
      description:
        "HR assistant that helps with recruitment and employee management.",
      interactions: 256,
      rating: 4.7,
      users: 167,
      price: {
        amount: 89.99,
        period: "monthly",
      },
      icon: "👥",
      categories: ["HR", "Recruitment", "Management"],
    },
  ];

  if (isDisconnected) {
    router.push("/login");
    return null;
  }

  const createBaseName = async () => {
    try {
      await fetch(`http://localhost:3000/api/basename/create`, {
        method: "POST",
        body: JSON.stringify({ basename: "tom" }),
      });
    } catch (error) {
      console.log(error);
    }
  };
  createBaseName();

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
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
