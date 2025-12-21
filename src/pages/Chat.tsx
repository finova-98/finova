
import { useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";
import { ChatInputBar } from "@/components/chat/ChatInputBar";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, FileText, HelpCircle, Paperclip, Trash2 } from "lucide-react";
import { useChat } from "@/context/ChatContext";

const suggestedPrompts = [
  { icon: TrendingUp, text: "I have 10k, what should I invest in?" },
  { icon: FileText, text: "Show my recent invoices" },
  { icon: Sparkles, text: "Summarize my expenses" },
  { icon: HelpCircle, text: "How can I reduce costs?" },
];

export default function Chat() {
  const { messages, isTyping, sendMessage, clearChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSuggestedPrompt = (text: string) => {
    sendMessage(text);
  };

  return (
    <AppLayout title="Financial Assistant" showBottomNav={true}>
      <div className="flex flex-col h-[calc(100vh-8rem)] relative">
        {/* Clear Chat Button */}
        {messages.length > 1 && (
          <div className="absolute top-2 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
              title="Clear Chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-hide py-4 pb-32">
          {messages.map((message, index) => (
            <div key={message.id}>
              <ChatMessageBubble
                content={message.content}
                role={message.role}
                animationDelay={index * 100}
              />
              {/* Show file attachment if present */}
              {message.file && message.role === "user" && (
                <div className="px-4 mb-4 animate-fade-in-up">
                  <div className="inline-flex items-center gap-2 bg-accent/50 border border-border rounded-2xl px-4 py-2">
                    <Paperclip className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">{message.file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(message.file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <ChatMessageBubble
              content=""
              role="assistant"
              isTyping={true}
            />
          )}

          {/* Suggested Prompts - only show at start */}
          {messages.length === 1 && (
            <div className="px-4 mt-6 space-y-2 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <p className="text-xs text-muted-foreground text-center mb-3">
                Try asking
              </p>
              <div className="grid grid-cols-2 gap-2">
                {suggestedPrompts.map((prompt, index) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSuggestedPrompt(prompt.text)}
                      className="flex items-start gap-2 p-3 rounded-2xl bg-card border border-border text-left hover:shadow-gpt-hover transition-all duration-200 active:scale-[0.98]"
                    >
                      <Icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-foreground line-clamp-2">
                        {prompt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <ChatInputBar
          onSend={sendMessage}
          disabled={isTyping}
          placeholder="Ask about finances, investments, or upload..."
        />
      </div>
    </AppLayout>
  );
}
