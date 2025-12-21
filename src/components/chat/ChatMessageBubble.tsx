import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageBubbleProps {
  content: string;
  role: "user" | "assistant";
  isTyping?: boolean;
  animationDelay?: number;
}

export function ChatMessageBubble({
  content,
  role,
  isTyping = false,
  animationDelay = 0
}: ChatMessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-2 animate-fade-in-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-chat-user text-chat-user-foreground rounded-br-lg"
            : "bg-chat-assistant text-chat-assistant-foreground rounded-bl-lg"
        )}
      >
        {isTyping ? (
          <div className="flex items-center gap-1 py-1">
            <span className="w-2 h-2 bg-current rounded-full typing-dot opacity-40" />
            <span className="w-2 h-2 bg-current rounded-full typing-dot opacity-40" />
            <span className="w-2 h-2 bg-current rounded-full typing-dot opacity-40" />
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
