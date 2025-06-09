"use client";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import {
  Plus,
  BookOpen,
  Star,
  StarOff,
  Send,
  Mic,
  Paperclip,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Bot,
  Info,
  LogOut,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import blockies from "blockies-ts";
import Image from "next/image";
import UserIcon from "@/components/UserIcon";

interface Group {
  id: string;
  title: string;
  purpose: string;
  unreadCount: number;
  isFavorite: boolean;
  lastMessage?: string;
  lastMessageTime?: Date;
  members: number;
  icon?: string;
  price?: {
    amount: number;
    period: "one-time" | "weekly" | "monthly" | "yearly";
    chain: string;
  };
}

interface Message {
  id: string;
  content: string;
  type: "text" | "voice" | "file" | "mini-app";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  isEdited?: boolean;
  isAgent?: boolean;
  agentType?: string;
  miniApp?:
    | {
        type: "price-alert";
        data: PriceAlertData;
      }
    | {
        type: "trading-summary";
        data: TradingSummaryData;
      }
    | {
        type: "poll";
        data: PollData;
      }
    | {
        type: "scam-alert";
        data: ScamAlertData;
      }
    | {
        type: "ai-analysis";
        data: AIAnalysisData;
      };
}

interface PriceAlertData {
  token: string;
  currentPrice: number;
  targetPrice: number;
  condition: "above" | "below";
  timeframe: string;
}

interface TradingSummaryData {
  totalTrades: number;
  winRate: number;
  profitLoss: number;
  topPerforming: string[];
  recentTrades: {
    token: string;
    type: "buy" | "sell";
    amount: number;
    price: number;
    timestamp: Date;
  }[];
}

interface PollData {
  question: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
  totalVotes: number;
  endTime: Date;
  votedBy: string[];
}

interface ScamAlertData {
  token: string;
  riskLevel: "low" | "medium" | "high";
  warnings: string[];
  contractAddress: string;
  lastUpdated: Date;
}

interface AIAnalysisData {
  token: string;
  sentiment: "bullish" | "bearish" | "neutral";
  confidence: number;
  keyPoints: string[];
  recommendations: string[];
  timeframe: string;
}

const PriceAlertMiniApp = ({ data }: { data: PriceAlertData }) => {
  const isAbove = data.condition === "above";
  const priceDiff = isAbove
    ? ((data.targetPrice - data.currentPrice) / data.currentPrice) * 100
    : ((data.currentPrice - data.targetPrice) / data.currentPrice) * 100;

  return (
    <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 w-full max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">Price Alert</h3>
        <Clock size={16} className="text-textDark/60" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-textDark/60">Token</span>
          <span className="font-medium">{data.token}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-textDark/60">Current Price</span>
          <span className="font-medium">${data.currentPrice.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-textDark/60">Target Price</span>
          <span className="font-medium">${data.targetPrice.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-textDark/60">Condition</span>
          <span
            className={`font-medium ${
              isAbove ? "text-green-500" : "text-red-500"
            }`}
          >
            {isAbove ? "Above" : "Below"} Target
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-textDark/60">Timeframe</span>
          <span className="font-medium">{data.timeframe}</span>
        </div>
        <div className="mt-4 p-3 bg-primary/10 rounded-lg">
          <div className="flex items-center gap-2">
            {isAbove ? (
              <ArrowUpRight size={16} className="text-green-500" />
            ) : (
              <ArrowDownRight size={16} className="text-red-500" />
            )}
            <span className="text-sm">
              {priceDiff.toFixed(2)}% {isAbove ? "to go" : "down"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TradingSummaryMiniApp = ({ data }: { data: TradingSummaryData }) => {
  return (
    <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 w-full max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">Trading Summary</h3>
        <BarChart2 size={16} className="text-textDark/60" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <div className="text-sm text-textDark/60">Total Trades</div>
          <div className="text-xl font-semibold">{data.totalTrades}</div>
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <div className="text-sm text-textDark/60">Win Rate</div>
          <div className="text-xl font-semibold">{data.winRate}%</div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-textDark/60">Profit/Loss</span>
          <span
            className={`font-medium ${
              data.profitLoss >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            ${data.profitLoss.toFixed(2)}
          </span>
        </div>
        <div>
          <div className="text-sm text-textDark/60 mb-2">Top Performing</div>
          <div className="flex flex-wrap gap-2">
            {data.topPerforming.map((token, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 rounded-full text-sm"
              >
                {token}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PollMiniApp = ({ data }: { data: PollData }) => {
  const hasVoted = data.votedBy.includes("current-user");
  const timeLeft = new Date(data.endTime).getTime() - Date.now();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));

  return (
    <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 w-full max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">Poll</h3>
        <div className="flex items-center gap-2">
          <Users size={16} className="text-textDark/60" />
          <span className="text-sm text-textDark/60">
            {data.totalVotes} votes
          </span>
        </div>
      </div>
      <div className="space-y-4">
        <p className="font-medium">{data.question}</p>
        <div className="space-y-2">
          {data.options.map((option) => {
            const percentage = (option.votes / data.totalVotes) * 100 || 0;
            return (
              <div key={option.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{option.text}</span>
                  <span className="text-sm text-textDark/60">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-sm text-textDark/60">
          <span>{hoursLeft}h left</span>
          {hasVoted && (
            <span className="flex items-center gap-1">
              <CheckCircle2 size={14} />
              Voted
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ScamAlertMiniApp = ({ data }: { data: ScamAlertData }) => {
  const riskColors = {
    low: "text-green-500",
    medium: "text-yellow-500",
    high: "text-red-500",
  };

  return (
    <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 w-full max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">Scam Alert</h3>
        <AlertTriangle size={16} className={riskColors[data.riskLevel]} />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-textDark/60">Token</span>
          <span className="font-medium">{data.token}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-textDark/60">Risk Level</span>
          <span className={`font-medium ${riskColors[data.riskLevel]}`}>
            {data.riskLevel.charAt(0).toUpperCase() + data.riskLevel.slice(1)}
          </span>
        </div>
        <div>
          <div className="text-sm text-textDark/60 mb-2">Warnings</div>
          <ul className="space-y-1">
            {data.warnings.map((warning, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <XCircle
                  size={14}
                  className="text-red-500 mt-1 flex-shrink-0"
                />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-xs text-textDark/60">
          Last updated: {data.lastUpdated.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

const AIAnalysisMiniApp = ({ data }: { data: AIAnalysisData }) => {
  const sentimentColors = {
    bullish: "text-green-500",
    bearish: "text-red-500",
    neutral: "text-yellow-500",
  };

  return (
    <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 w-full max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">AI Analysis</h3>
        <TrendingUp size={16} className={sentimentColors[data.sentiment]} />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-textDark/60">Token</span>
          <span className="font-medium">{data.token}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-textDark/60">Sentiment</span>
          <span className={`font-medium ${sentimentColors[data.sentiment]}`}>
            {data.sentiment.charAt(0).toUpperCase() + data.sentiment.slice(1)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-textDark/60">Confidence</span>
          <span className="font-medium">{data.confidence}%</span>
        </div>
        <div>
          <div className="text-sm text-textDark/60 mb-2">Key Points</div>
          <ul className="space-y-1">
            {data.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2
                  size={14}
                  className="text-green-500 mt-1 flex-shrink-0"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-sm text-textDark/60 mb-2">Recommendations</div>
          <ul className="space-y-1">
            {data.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <ArrowUpRight
                  size={14}
                  className="text-primary mt-1 flex-shrink-0"
                />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-xs text-textDark/60">
          Timeframe: {data.timeframe}
        </div>
      </div>
    </div>
  );
};

export default function Details() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams();
  const groupId = id as string;
  const router = useRouter();

  // Generate dummy messages
  useEffect(() => {
    console.log(groupId);

    if (groupId) {
      const dummyMessages: Message[] = [
        {
          id: "msg-1",
          content: "I've set up a price alert for ETH",
          type: "mini-app",
          sender: {
            id: "agent-1",
            name: "Trading Assistant",
            avatar: blockies
              .create({
                seed: "agent-1",
                size: 8,
                scale: 4,
              })
              .toDataURL(),
          },
          timestamp: new Date(Date.now() - 3600000),
          isAgent: true,
          agentType: "Trading Assistant",
          miniApp: {
            type: "price-alert",
            data: {
              token: "ETH",
              currentPrice: 3500.45,
              targetPrice: 4000.0,
              condition: "above",
              timeframe: "24h",
            } as PriceAlertData,
          },
        },
        {
          id: "msg-2",
          content: "Here's your weekly trading summary",
          type: "mini-app",
          sender: {
            id: "agent-1",
            name: "Trading Assistant",
            avatar: blockies
              .create({
                seed: "agent-1",
                size: 8,
                scale: 4,
              })
              .toDataURL(),
          },
          timestamp: new Date(Date.now() - 7200000),
          isAgent: true,
          agentType: "Trading Assistant",
          miniApp: {
            type: "trading-summary",
            data: {
              totalTrades: 15,
              winRate: 73.3,
              profitLoss: 1250.75,
              topPerforming: ["ETH", "SOL", "AVAX"],
              recentTrades: [
                {
                  token: "ETH",
                  type: "buy",
                  amount: 0.5,
                  price: 3450.0,
                  timestamp: new Date(Date.now() - 3600000),
                },
                {
                  token: "SOL",
                  type: "sell",
                  amount: 10,
                  price: 95.5,
                  timestamp: new Date(Date.now() - 7200000),
                },
              ],
            } as TradingSummaryData,
          },
        },
        {
          id: "msg-3",
          content: "Let's vote on the next token to analyze",
          type: "mini-app",
          sender: {
            id: "agent-1",
            name: "Trading Assistant",
            avatar: blockies
              .create({
                seed: "agent-1",
                size: 8,
                scale: 4,
              })
              .toDataURL(),
          },
          timestamp: new Date(Date.now() - 10800000),
          isAgent: true,
          agentType: "Trading Assistant",
          miniApp: {
            type: "poll",
            data: {
              question: "Which token should we analyze next?",
              options: [
                { id: "1", text: "Bitcoin (BTC)", votes: 12 },
                { id: "2", text: "Ethereum (ETH)", votes: 8 },
                { id: "3", text: "Solana (SOL)", votes: 15 },
                { id: "4", text: "Avalanche (AVAX)", votes: 5 },
              ],
              totalVotes: 40,
              endTime: new Date(Date.now() + 86400000),
              votedBy: ["user-1", "user-2"],
            } as PollData,
          },
        },
        {
          id: "msg-4",
          content: "⚠️ Important: Scam Alert",
          type: "mini-app",
          sender: {
            id: "agent-1",
            name: "Security Assistant",
            avatar: blockies
              .create({
                seed: "agent-1",
                size: 8,
                scale: 4,
              })
              .toDataURL(),
          },
          timestamp: new Date(Date.now() - 14400000),
          isAgent: true,
          agentType: "Security Assistant",
          miniApp: {
            type: "scam-alert",
            data: {
              token: "FAKE-TOKEN",
              riskLevel: "high",
              warnings: [
                "Unverified contract address",
                "Suspicious token distribution",
                "No liquidity locked",
                "Team wallets not verified",
              ],
              contractAddress: "0x1234...5678",
              lastUpdated: new Date(),
            } as ScamAlertData,
          },
        },
        {
          id: "msg-5",
          content: "AI Analysis: ETH Price Prediction",
          type: "mini-app",
          sender: {
            id: "agent-1",
            name: "AI Analyst",
            avatar: blockies
              .create({
                seed: "agent-1",
                size: 8,
                scale: 4,
              })
              .toDataURL(),
          },
          timestamp: new Date(Date.now() - 18000000),
          isAgent: true,
          agentType: "AI Analyst",
          miniApp: {
            type: "ai-analysis",
            data: {
              token: "ETH",
              sentiment: "bullish",
              confidence: 85,
              keyPoints: [
                "Strong institutional buying pressure",
                "Positive on-chain metrics",
                "Growing DeFi TVL",
                "Upcoming network upgrades",
              ],
              recommendations: [
                "Consider DCA strategy",
                "Set stop-loss at $3200",
                "Monitor gas fees for optimal entry",
              ],
              timeframe: "7 days",
            } as AIAnalysisData,
          },
        },
        ...Array.from({ length: 15 }, (_, index) => ({
          id: `msg-${index + 6}`,
          content: `This is message ${index + 6} in the group chat.`,
          type: "text" as const,
          sender: {
            id: `user-${index % 5}`,
            name: `User ${(index % 5) + 1}`,
            avatar: blockies
              .create({
                seed: `user-${index % 5}`,
                size: 8,
                scale: 4,
              })
              .toDataURL(),
          },
          timestamp: new Date(Date.now() - (100 - index) * 60000),
          isEdited: Math.random() > 0.9,
          isAgent: Math.random() > 0.9,
          agentType: Math.random() > 0.9 ? "AI Assistant" : undefined,
        })),
      ];
      setMessages(dummyMessages);
    }
  }, [groupId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !isRecording) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      type: "text",
      sender: {
        id: "current-user",
        name: "You",
        avatar: blockies
          .create({
            seed: "current-user",
            size: 8,
            scale: 4,
          })
          .toDataURL(),
      },
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: "Shared a file",
      type: "file",
      fileUrl: URL.createObjectURL(file),
      fileName: file.name,
      fileSize: file.size,
      sender: {
        id: "current-user",
        name: "You",
        avatar: blockies
          .create({
            seed: "current-user",
            size: 8,
            scale: 4,
          })
          .toDataURL(),
      },
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const handleVoiceMessage = () => {
    setIsRecording(!isRecording);
    // Add voice recording logic here
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    setActiveMenu(null);
  };

  const handleEditMessage = (messageId: string) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      setInputMessage(message.content);
      setActiveMenu(null);
    }
    setActiveMenu(null);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setActiveMenu(null);
  };

  useEffect(() => {
    if (groupId) {
      // In a real app, this would be an API call to fetch the group details
      // For now, we'll create a dummy group
      const dummyGroup: Group = {
        id: groupId,
        title: `Group ${groupId.split("-")[1]}`,
        purpose: "General Discussion",
        unreadCount: Math.floor(Math.random() * 20),
        isFavorite: Math.random() > 0.7,
        lastMessage: "Last message in the group...",
        lastMessageTime: new Date(),
        members: Math.floor(Math.random() * 50) + 5,
      };
      setGroup(dummyGroup);
    }
  }, [groupId]);

  const toggleFavorite = () => {
    if (group) {
      setGroup({ ...group, isFavorite: !group.isFavorite });
    }
  };

  // Generate blockies icon for group if no icon is available
  const groupIcon = group?.icon
    ? group.icon
    : group
    ? blockies
        .create({
          seed: group.id,
          size: 8,
          scale: 4,
        })
        .toDataURL()
    : undefined;

  if (!group) {
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
            <div className="text-center max-w-md">
              <div className="flex justify-center items-center gap-2 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center transform -rotate-12">
                  <BookOpen size={32} className="text-primary" />
                </div>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center transform rotate-12">
                  <BookOpen size={32} className="text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Group Not Found</h2>
              <p className="text-textDark/60 dark:text-textLight/60 mb-6">
                The group you&apos;re looking for doesn&apos;t exist or you
                don&apos;t have access to it.
              </p>
              <button
                onClick={() => router.push("/groups/create")}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-textLight rounded-lg hover:bg-accent transition-colors mx-auto"
              >
                <Plus size={20} />
                <span>Create Group</span>
              </button>
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
        <div className="flex flex-col h-[calc(100vh-5rem)]">
          {/* Group Header */}
          <div className="bg-background border-b border-neutral-200 dark:border-neutral-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {group?.icon ? (
                  <span className="text-2xl">{group.icon}</span>
                ) : (
                  <Image
                    width={10}
                    height={10}
                    src={groupIcon!}
                    alt={group?.title}
                    className="w-10 h-10 rounded-full"
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">{group?.title}</h2>
                    <p className="text-sm text-textDark/60 dark:text-textLight/60">
                      {group?.members} members
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleFavorite}
                      className={`p-2 rounded-full transition-colors ${
                        group?.isFavorite
                          ? "text-accent hover:bg-accent/10"
                          : "text-textDark/60 hover:bg-primary/10"
                      }`}
                    >
                      {group?.isFavorite ? (
                        <Star size={20} />
                      ) : (
                        <StarOff size={20} />
                      )}
                    </button>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === group.id ? null : group.id
                          )
                        }
                        className="text-textLight/60 hover:text-textLight transition-colors p-1"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Message Menu */}
                      {activeMenu === group.id && (
                        <div className="absolute right-0 top-full mt-1 bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-10 message-menu">
                          <div className="py-1">
                            <button
                              onClick={() =>
                                router.push(`/groups/${groupId}/info`)
                              }
                              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary/10 w-full text-left"
                            >
                              <Info size={16} />
                              Info
                            </button>
                            <button
                              onClick={() => {}}
                              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-error/10 text-error w-full text-left"
                            >
                              <LogOut size={16} />
                              Leave
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-background"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundPosition: "center",
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender.id === "current-user"
                    ? "justify-end"
                    : "justify-start"
                } items-end gap-2`}
              >
                {/* Avatar */}
                {message.sender.id !== "current-user" && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    {message.isAgent ? (
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <Bot size={16} className="text-accent" />
                      </div>
                    ) : (
                      <img
                        src={message.sender.avatar}
                        alt={message.sender.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                  </div>
                )}

                {/* Message Content */}
                <div
                  className={`max-w-[70%] rounded-lg p-3 relative ${
                    message.sender.id === "current-user"
                      ? "bg-primary text-textLight"
                      : "bg-background border border-neutral-200 dark:border-neutral-800 text-textDark dark:text-textLight"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 overflow-hidden">
                    <div>
                      {message.sender.id !== "current-user" && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {message.sender.name}
                          </span>
                          {message.isAgent && (
                            <span className="text-xs text-accent">
                              {message.agentType}
                            </span>
                          )}
                        </div>
                      )}
                      {message.type === "text" ? (
                        <p className="whitespace-pre-wrap break-words text-sm">
                          {message.content}
                          {message.isEdited && (
                            <span className="text-xs opacity-60 ml-1">
                              (edited)
                            </span>
                          )}
                        </p>
                      ) : message.type === "file" ? (
                        <div className="flex items-center gap-2">
                          <Paperclip size={16} />
                          <a
                            href={message.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:underline"
                          >
                            {message.fileName}
                          </a>
                          <span className="text-xs opacity-60">
                            ({Math.round(message.fileSize! / 1024)} KB)
                          </span>
                        </div>
                      ) : message.type === "mini-app" && message.miniApp ? (
                        <div className="w-full max-w-md">
                          {message.miniApp.type === "price-alert" && (
                            <PriceAlertMiniApp data={message.miniApp.data} />
                          )}
                          {message.miniApp.type === "trading-summary" && (
                            <TradingSummaryMiniApp
                              data={message.miniApp.data}
                            />
                          )}
                          {message.miniApp.type === "poll" && (
                            <PollMiniApp data={message.miniApp.data} />
                          )}
                          {message.miniApp.type === "scam-alert" && (
                            <ScamAlertMiniApp data={message.miniApp.data} />
                          )}
                          {message.miniApp.type === "ai-analysis" && (
                            <AIAnalysisMiniApp data={message.miniApp.data} />
                          )}
                        </div>
                      ) : null}
                    </div>
                    {message.sender.id === "current-user" && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === message.id ? null : message.id
                            )
                          }
                          className="text-textLight/60 hover:text-textLight transition-colors p-1"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Message Menu */}
                        {activeMenu === message.id && (
                          <div className="absolute right-0 top-full mt-1 bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-10 message-menu">
                            <div className="py-1">
                              <button
                                onClick={() =>
                                  handleCopyMessage(message.content)
                                }
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary/10 w-full text-left"
                              >
                                <Copy size={16} />
                                Copy
                              </button>
                              <button
                                onClick={() => handleEditMessage(message.id)}
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary/10 w-full text-left"
                              >
                                <Edit2 size={16} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-error/10 text-error w-full text-left"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs opacity-60">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {message.sender.id === "current-user" && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    <UserIcon size={8} />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Container */}
          <div className="bg-background border-t border-neutral-200 dark:border-neutral-800 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type a message"
                    className="w-full p-3 pr-24 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={1}
                    style={{ minHeight: "44px", maxHeight: "200px" }}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 text-textDark/60 hover:text-primary transition-colors"
                    >
                      <Paperclip size={20} />
                    </button>
                    <button
                      onClick={handleVoiceMessage}
                      className={`p-1.5 transition-colors ${
                        isRecording
                          ? "text-error hover:text-error/80"
                          : "text-textDark/60 hover:text-primary"
                      }`}
                    >
                      <Mic size={20} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() && !isRecording}
                  className="p-3 rounded-lg bg-primary text-textLight disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
