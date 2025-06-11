import { useConversation, useIdentity } from "@/query/xmtp";
import { Conversation } from "@xmtp/browser-sdk";
import { Copy, Edit2, Trash2 } from "lucide-react";
import React, { useEffect, useRef } from "react";

interface MessagesProps {
  conversation?: Conversation;
}

export const Messages: React.FC<MessagesProps> = ({ conversation }) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { inboxId } = useIdentity();
  const { messages } = useConversation(conversation);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col gap-4 flex-1 overflow-y-scroll my-3">
      {messages.map((message) => (
        <React.Fragment key={message.id}>
          <div
            key={message.id}
            className={`flex ${
              message.senderInboxId === inboxId
                ? "justify-end"
                : "justify-start"
            } items-end gap-2`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 relative "bg-background border border-neutral-200 dark:border-neutral-800 text-textDark dark:text-textLight"
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="whitespace-pre-wrap break-words text-sm">
                  {message.content as string}
                </p>
                {message.senderInboxId === inboxId && (
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
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* <MessageCard
            message={message}
            isSender={message.senderInboxId === inboxId}
          /> */}
        </React.Fragment>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
