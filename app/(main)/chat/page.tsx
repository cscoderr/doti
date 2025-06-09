"use client";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Trash2,
  Loader2,
  MoreVertical,
  Copy,
  Edit2,
  Paperclip,
  Mic,
  Smile,
} from "lucide-react";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import blockies from "blockies-ts";
import Image from "next/image";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
  isEdited?: boolean;
  avatar?: string;
}

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // DOTI icon for AI
  const dotiIcon = "D";

  // Generate 50 dummy messages
  useEffect(() => {
    const dummyMessages: Message[] = Array.from({ length: 50 }, (_, index) => ({
      id: `msg-${index}`,
      content: `This is message ${index + 1}. ${
        index % 3 === 0
          ? "This is a longer message to test how the chat interface handles multiple lines of text and wrapping."
          : ""
      }`,
      role: index % 2 === 0 ? "user" : "assistant",
      timestamp: new Date(Date.now() - (50 - index) * 60000),
      status:
        index % 2 === 0 ? (index % 3 === 0 ? "read" : "delivered") : undefined,
      isEdited: index % 5 === 0,
      avatar:
        index % 2 === 0
          ? blockies
              .create({
                seed: `user-${index}`,
                size: 8,
                scale: 4,
              })
              .toDataURL()
          : undefined,
    }));
    setMessages(dummyMessages);
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
    if (!inputMessage.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date(),
      status: "sent",
      avatar: blockies
        .create({
          seed: `user-${Date.now()}`,
          size: 8,
          scale: 4,
        })
        .toDataURL(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "This is a simulated AI response. Replace this with actual AI integration.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 2000);
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    setActiveMenu(null);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setActiveMenu(null);
  };

  const handleEditMessage = () => {
    setActiveMenu(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
          {/* Chat Header */}
          <div className="bg-background border-b border-neutral-200 dark:border-neutral-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
                <span className="text-textLight font-bold text-lg">
                  {dotiIcon}
                </span>
              </div>
              <div>
                <h2 className="font-semibold">DOTI Assistant</h2>
                <p className="text-sm text-textDark/60 dark:text-textLight/60">
                  Online
                </p>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-background"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } items-end gap-2`}
              >
                {/* Avatar */}
                {message.role === "assistant" ? (
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {dotiIcon}
                    </span>
                  </div>
                ) : message.avatar ? (
                  <Image
                    width={8}
                    height={8}
                    src={message.avatar}
                    alt="User"
                    className="w-8 h-8 rounded-full"
                  />
                ) : null}

                {/* Message Content */}
                <div
                  className={`max-w-[70%] rounded-lg p-3 relative ${
                    message.role === "user"
                      ? "bg-primary text-textLight"
                      : "bg-background border border-neutral-200 dark:border-neutral-800 text-textDark dark:text-textLight"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {message.content}
                      {message.isEdited && (
                        <span className="text-xs opacity-60 ml-1">
                          (edited)
                        </span>
                      )}
                    </p>
                    {message.role === "user" && (
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
                                onClick={() => handleEditMessage()}
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
                    {message.role === "user" && message.status && (
                      <span className="text-xs opacity-60">
                        {message.status === "read" ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-textLight font-bold text-sm">
                    {dotiIcon}
                  </span>
                </div>
                <div className="max-w-[70%] rounded-lg p-3 bg-background border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
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
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message"
                    className="w-full p-3 pr-24 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={1}
                    style={{ minHeight: "44px", maxHeight: "200px" }}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <button className="p-1.5 text-textDark/60 dark:text-textLight/60 hover:text-primary transition-colors">
                      <Smile size={20} />
                    </button>
                    <button className="p-1.5 text-textDark/60 dark:text-textLight/60 hover:text-primary transition-colors">
                      <Paperclip size={20} />
                    </button>
                    <button className="p-1.5 text-textDark/60 dark:text-textLight/60 hover:text-primary transition-colors">
                      <Mic size={20} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isGenerating}
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
