import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Paperclip, Send, Smile } from "lucide-react";
import { Conversation, DecodedMessage } from "@xmtp/browser-sdk";
import BlockiesIcon from "./BlockiesIcon";
import { useXMTP } from "@/context/XmtpProvider";
import CircularProgressBar from "./CircularProgressBar";
import { env } from "@/lib/env";
import ReactMarkdown from "react-markdown";

export default function Messages() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isGenerating] = useState(false);

  const { client } = useXMTP();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<DecodedMessage[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const streamStartedRef = useRef(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeConversation = useCallback(async () => {
    if (!client) return;
    let conversation: Conversation | null = null;
    setIsConnecting(true);
    try {
      conversation = (await client.conversations.newDmWithIdentifier({
        identifier: env.dotiBotAddress,
        identifierKind: "Ethereum",
      })) as Conversation;

      setConversation(conversation);
    } catch (error) {
      console.error("Error initializing conversation:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [client]);

  // Start a stream to listen for new messages
  const startMessageStream = useCallback(async () => {
    // Prevent double initialization and infinite loops
    if (!client || !conversation || streamActive || streamStartedRef.current)
      return;

    try {
      // Set flag before state to prevent race conditions
      streamStartedRef.current = true;
      setStreamActive(true);

      const stream = await conversation.stream();
      // Handle the stream with for await...of loop
      const streamMessages = async () => {
        try {
          for await (const message of stream) {
            // Ensure we don't add undefined to the messages array
            if (message) {
              setMessages((prevMessages) => [...prevMessages, message]);
            }
          }
        } catch (error) {
          console.error("Error in message stream:", error);
          setStreamActive(false);
          streamStartedRef.current = false;
        }
      };

      // Start listening for messages
      streamMessages();
      // Return a cleanup function
      return () => {
        if (stream && typeof stream.return === "function") {
          stream.return(undefined);
        }
        setStreamActive(false);
        streamStartedRef.current = false;
      };
    } catch (error) {
      console.error("Error starting message stream:", error);
      setStreamActive(false);
      streamStartedRef.current = false;
      return undefined;
    }
  }, [client, conversation]);

  // Initialize conversation when client is available
  useEffect(() => {
    if (client && !conversation && !isConnecting) {
      initializeConversation();
    }
  }, [client, conversation, isConnecting, initializeConversation]);

  // Start stream when conversation is available
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    // Only start the stream if we have a conversation and the stream isn't already active
    if (client && conversation && !streamActive && !streamStartedRef.current) {
      startMessageStream().then((cleanupFn) => {
        cleanup = cleanupFn;
      });
    }

    // Clean up when component unmounts or dependencies change
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [client, conversation, streamActive, startMessageStream]);

  // Send message to the bot
  const handleSendMessage = async () => {
    if (!client || !conversation || !message.trim()) return;

    setSending(true);

    try {
      // Send the message to the bot
      await conversation.send(message);

      // Clear input
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };
  return (
    <>
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-background"
      >
        {messages.map((msg, index) => {
          // Get sender address safely
          const senderAddress = msg.senderInboxId;

          // Get client address
          const clientAddress = client?.inboxId;

          const isUser = senderAddress === clientAddress;

          // Get message sent time safely
          const sentTime = msg.sentAtNs
            ? new Date(Number(msg.sentAtNs) / 1000000)
            : new Date();
          return (
            <div
              key={index}
              className={`flex ${
                isUser ? "justify-end" : "justify-start"
              } items-end gap-2`}
            >
              {/* Avatar */}
              {!isUser ? (
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
              ) : (
                <BlockiesIcon
                  size={8}
                  address={msg.senderInboxId as `0x${string}`}
                />
              )}

              {/* Message Content */}
              <div
                className={`max-w-[70%] rounded-lg p-3 relative ${
                  isUser
                    ? "bg-primary text-textLight"
                    : "bg-background border border-neutral-200 dark:border-neutral-800 text-textDark dark:text-textLight"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="whitespace-pre-wrap break-words text-sm">
                    <ReactMarkdown>{String(msg.content)}</ReactMarkdown>
                  </span>
                  {isUser && (
                    <div className="relative">
                      {/* Message Menu */}
                      {/* {activeMenu === message.id && (
                      <div className="absolute right-0 top-full mt-1 bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-10 message-menu">
                        <div className="py-1">
                          <button
                            onClick={() => handleCopyMessage(message.content)}
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
                    )} */}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs opacity-60">
                    {sentTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isUser && msg.deliveryStatus && (
                    <span className="text-xs opacity-60">
                      {msg.deliveryStatus === "published" ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {isGenerating && (
          <div className="flex justify-start items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-textLight font-bold text-sm">D</span>
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
      {/* Input container */}
      <div className="bg-background border-t border-neutral-200 dark:border-neutral-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !sending) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message"
                className="w-full p-3 pr-24 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={1}
                style={{ minHeight: "44px", maxHeight: "200px" }}
              />
              {/* <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button className="p-1.5 text-textDark/60 dark:text-textLight/60 hover:text-primary transition-colors">
                  <Smile size={20} />
                </button>
                <button className="p-1.5 text-textDark/60 dark:text-textLight/60 hover:text-primary transition-colors">
                  <Paperclip size={20} />
                </button>
              </div> */}
            </div>
            <button
              onClick={handleSendMessage}
              //isGenerating
              disabled={!message.trim() || sending}
              className="p-3 rounded-lg bg-primary text-textLight disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
            >
              {!sending && <Send size={20} />}
              {sending && (
                <CircularProgressBar size={20} color="var(--secondary)" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
