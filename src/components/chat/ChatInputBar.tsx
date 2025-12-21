import { useState, KeyboardEvent, useRef } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputBarProps {
  onSend: (message: string, file?: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInputBar({
  onSend,
  disabled = false,
  placeholder = "Message..."
}: ChatInputBarProps) {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((message.trim() || selectedFile) && !disabled) {
      onSend(message.trim(), selectedFile || undefined);
      setMessage("");
      setSelectedFile(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 p-4 bg-gradient-to-t from-background via-background to-transparent">
      <div className="max-w-2xl mx-auto">
        {/* File Preview */}
        {selectedFile && (
          <div className="mb-2 bg-card rounded-2xl border border-border p-3 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Paperclip className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground truncate">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              className="h-8 w-8 rounded-full flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-end gap-2 bg-card rounded-3xl border border-border shadow-gpt p-2">
          {/* File Upload Button */}
          <div className="pb-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>

          {/* Text Input */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none max-h-32 scrollbar-hide",
              disabled && "opacity-50"
            )}
            style={{ minHeight: "44px" }}
          />

          {/* Send Button */}
          <div className="flex items-center gap-1 pb-1">
            <Button
              variant="gpt-primary"
              size="icon"
              onClick={handleSend}
              disabled={disabled || (!message.trim() && !selectedFile)}
              className="rounded-full h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
