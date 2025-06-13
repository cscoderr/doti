import { Mic, Paperclip, Send, Smile } from "lucide-react";

const MessageInput = ({
  inputMessage,
  setInputMessage,
  onKeyDown,
  onSubmit,
}: {
  inputMessage: string;
  setInputMessage: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSubmit: () => void;
}) => {
  return (
    <div className="bg-background border-t border-neutral-200 dark:border-neutral-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={onKeyDown}
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
            onClick={onSubmit}
            //isGenerating
            disabled={!inputMessage.trim()}
            className="p-3 rounded-lg bg-primary text-textLight disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default MessageInput;
