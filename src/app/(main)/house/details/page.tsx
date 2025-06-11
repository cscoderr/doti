"use client";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import {
  Send,
  StopCircle,
  Trash2,
  Loader2,
  MoreVertical,
  Copy,
  Edit2,
  Paperclip,
  Mic,
  Home,
  Building2,
  Building,
  Users,
  MessageSquare,
  Star,
  StarOff,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import blockies from "blockies-ts";

interface House {
  id: string;
  title: string;
  type: "apartment" | "house" | "condo" | "townhouse";
  address: string;
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
  type: "text" | "voice" | "file";
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
}

interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
  isActive: boolean;
}

export default function HouseDetails() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [house, setHouse] = useState<House | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const houseId = searchParams.get("id");

  // Generate dummy messages
  useEffect(() => {
    if (houseId) {
      const dummyMessages: Message[] = Array.from(
        { length: 20 },
        (_, index) => ({
          id: `msg-${index}`,
          content: `This is message ${index + 1} in the house group chat.`,
          type: "text",
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
          timestamp: new Date(Date.now() - (20 - index) * 60000),
          isEdited: Math.random() > 0.9,
          isAgent: Math.random() > 0.9,
          agentType: Math.random() > 0.9 ? "AI Assistant" : undefined,
        })
      );
      setMessages(dummyMessages);
    }
  }, [houseId]);

  // Generate dummy agents
  useEffect(() => {
    const dummyAgents: Agent[] = [
      {
        id: "agent-1",
        name: "Maintenance Bot",
        type: "Maintenance",
        description: "AI-powered maintenance assistant",
        icon: "🔧",
        isActive: true,
      },
      {
        id: "agent-2",
        name: "Rent Assistant",
        type: "Finance",
        description: "Rent payment and tracking assistant",
        icon: "💰",
        isActive: false,
      },
    ];
    setAgents(dummyAgents);
  }, []);

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
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setActiveMenu(null);
  };

  useEffect(() => {
    if (houseId) {
      // In a real app, this would be an API call to fetch the house details
      const dummyHouse: House = {
        id: houseId,
        title: `Sunset ${
          ["Apartments", "Houses", "Condos", "Townhouses"][
            parseInt(houseId) % 4
          ]
        }`,
        type: ["apartment", "house", "condo", "townhouse"][
          parseInt(houseId) % 4
        ] as House["type"],
        address: `${1000 + parseInt(houseId)} Main St, City, State ${
          10000 + parseInt(houseId)
        }`,
        unreadCount: Math.floor(Math.random() * 20),
        isFavorite: Math.random() > 0.7,
        lastMessage: "Last message in the group...",
        lastMessageTime: new Date(),
        members: Math.floor(Math.random() * 50) + 5,
        price: {
          amount: Math.floor(Math.random() * 1000) + 500,
          period: ["one-time", "weekly", "monthly", "yearly"][
            Math.floor(Math.random() * 4)
          ] as "one-time" | "weekly" | "monthly" | "yearly",
          chain: ["USDC on Base", "ETH on Base", "USDC on Optimism"][
            Math.floor(Math.random() * 3)
          ],
        },
      };
      setHouse(dummyHouse);
    }
  }, [houseId]);

  const toggleFavorite = () => {
    if (house) {
      setHouse({ ...house, isFavorite: !house.isFavorite });
    }
  };

  const getHouseIcon = (type: House["type"]) => {
    switch (type) {
      case "apartment":
        return <Building size={24} />;
      case "house":
        return <Home size={24} />;
      case "condo":
        return <Building2 size={24} />;
      case "townhouse":
        return <Building2 size={24} />;
      default:
        return <Home size={24} />;
    }
  };

  if (!house) {
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
              <p className="text-textDark/60 dark:text-textLight/60">
                Loading house details...
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
          {/* House Header */}
          <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="text-primary">{getHouseIcon(house.type)}</div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{house.title}</h1>
                  <p className="text-textDark/60 dark:text-textLight/60">
                    {house.address}
                  </p>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span className="text-sm">{house.members} members</span>
                    </div>
                    {house.price && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-accent">
                          {house.price.amount} {house.price.chain} /
                          {house.price.period}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-full transition-colors ${
                  house.isFavorite
                    ? "text-accent hover:bg-accent/10"
                    : "text-textDark/60 hover:bg-primary/10"
                }`}
              >
                {house.isFavorite ? <Star size={24} /> : <StarOff size={24} />}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Section */}
            <div className="lg:col-span-2">
              <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">House Chat</h2>
                </div>

                {/* Messages Container */}
                <div className="h-[600px] overflow-y-auto mb-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender.id === "current-user"
                          ? "justify-end"
                          : "justify-start"
                      } items-start gap-2`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.sender.id === "current-user"
                            ? "order-2"
                            : "order-1"
                        }`}
                      >
                        {message.isAgent ? (
                          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                            <span className="text-accent">🤖</span>
                          </div>
                        ) : (
                          <img
                            src={message.sender.avatar}
                            alt={message.sender.name}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                      </div>

                      {/* Message Content */}
                      <div
                        className={`max-w-[80%] md:max-w-[70%] rounded-lg p-4 relative ${
                          message.sender.id === "current-user"
                            ? "bg-primary text-textLight order-1"
                            : "bg-background border border-neutral-200 dark:border-neutral-800 order-2"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
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
                            {message.type === "text" ? (
                              <p className="whitespace-pre-wrap break-words">
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
                            ) : null}
                          </div>
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveMenu(
                                  activeMenu === message.id ? null : message.id
                                )
                              }
                              className="text-textDark/60 dark:text-textLight/60 hover:text-primary transition-colors p-1"
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
                                  {message.sender.id === "current-user" && (
                                    <button
                                      onClick={() =>
                                        handleEditMessage(message.id)
                                      }
                                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary/10 w-full text-left"
                                    >
                                      <Edit2 size={16} />
                                      Edit
                                    </button>
                                  )}
                                  {message.sender.id === "current-user" && (
                                    <button
                                      onClick={() =>
                                        handleDeleteMessage(message.id)
                                      }
                                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-error/10 text-error w-full text-left"
                                    >
                                      <Trash2 size={16} />
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs opacity-60 mt-2 block">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Container */}
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message..."
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

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Members Section */}
              <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Members</h2>
                <div className="space-y-4">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      <img
                        src={blockies
                          .create({
                            seed: `user-${i}`,
                            size: 8,
                            scale: 4,
                          })
                          .toDataURL()}
                        alt={`User ${i + 1}`}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium">User {i + 1}</p>
                        <p className="text-xs text-textDark/60 dark:text-textLight/60">
                          Member
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agents Section */}
              <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">House Agents</h2>
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-accent">{agent.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-xs text-textDark/60 dark:text-textLight/60">
                          {agent.type}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            agent.isActive ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
