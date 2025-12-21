
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendChatMessage, buildConversationHistory } from "@/lib/openrouter";
import { extractPDFText, isPDF, formatPDFTextForAI } from "@/lib/pdfParser";
import axios from "axios";

export interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
    file?: {
        name: string;
        size: number;
    };
}

interface ChatContextType {
    messages: Message[];
    isTyping: boolean;
    sendMessage: (content: string, file?: File) => Promise<void>;
    clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const initialMessages: Message[] = [
    {
        id: "1",
        content: "Hi! I'm your AI financial assistant. I can help you analyze invoices, track spending, and offer investment suggestions based on live market data. What would you like to know?",
        role: "assistant",
    },
];

const contextStocks = [
    { symbol: "RELIANCE.NS", name: "Reliance Industries" },
    { symbol: "TCS.NS", name: "Tata Consultancy Svcs" },
    { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
    { symbol: "INFY.NS", name: "Infosys Ltd" },
    { symbol: "ICICIBANK.NS", name: "ICICI Bank" },
    { symbol: "TATAMOTORS.NS", name: "Tata Motors" },
    { symbol: "SBIN.NS", name: "State Bank of India" }
];

export function ChatProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>(() => {
        const saved = localStorage.getItem("chat_history");
        return saved ? JSON.parse(saved) : initialMessages;
    });
    const [isTyping, setIsTyping] = useState(false);
    const [marketContext, setMarketContext] = useState<string>("");

    useEffect(() => {
        localStorage.setItem("chat_history", JSON.stringify(messages));
    }, [messages]);

    // Fetch Market Data Logic
    useEffect(() => {
        const fetchContextData = async () => {
            const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
            if (!apiKey) return;

            try {
                const promises = contextStocks.map(async (stock) => {
                    try {
                        const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${apiKey}`);
                        if (response.data.c) {
                            const price = response.data.c;
                            const change = ((price - response.data.pc) / response.data.pc) * 100;
                            return `${stock.name} (${stock.symbol}): ₹${price.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}%)`;
                        }
                    } catch (e) {
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                const validResults = results.filter(r => r !== null && r !== undefined);
                if (validResults.length > 0) {
                    setMarketContext(validResults.join("\n"));
                }
            } catch (err) {
                console.error("Failed to fetch market context", err);
            }
        };
        fetchContextData();
    }, []);

    const sendMessage = async (content: string, file?: File) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            content: content || (file ? "I've uploaded an invoice for analysis" : ""),
            role: "user",
            file: file ? { name: file.name, size: file.size } : undefined,
        };

        // Optimistic update
        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        try {
            let userPrompt = content;

            if (file) {
                if (isPDF(file)) {
                    toast({ title: "PDF uploaded!", description: "Extracting text..." });
                    try {
                        const extractedText = await extractPDFText(file);
                        userPrompt = formatPDFTextForAI(extractedText, file.name);
                        if (content) userPrompt += `\n\nAdditional instructions: ${content}`;
                        toast({ title: "PDF processed!", description: `Analyzing ${file.name}...` });
                    } catch (pdfError) {
                        const msg = pdfError instanceof Error ? pdfError.message : "Failed to process PDF";
                        toast({ title: "PDF Error", description: msg, variant: "destructive" });
                        userPrompt = `Uploaded "${file.name}" but extraction failed. ${content}`;
                    }
                } else {
                    toast({ title: "File uploaded!", description: "Analyzing..." });
                    userPrompt = `Uploaded "${file.name}". ${content || "Analyze this file."}`;
                }
            }

            const conversationHistory = buildConversationHistory([
                ...messages.map(msg => ({ role: msg.role, content: msg.content })),
                { role: "user", content: userPrompt }
            ], marketContext);

            const response = await sendChatMessage(conversationHistory);

            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                content: response,
                role: "assistant"
            }]);

        } catch (error) {
            setIsTyping(false);
            const msg = error instanceof Error ? error.message : "Error occurred";
            toast({ title: "Error", description: msg, variant: "destructive" });
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                content: `Error: ${msg}`,
                role: "assistant"
            }]);
        }
    };

    const clearChat = () => {
        setMessages(initialMessages);
        localStorage.removeItem("chat_history");
        toast({ title: "Chat cleared", description: "History reset." });
    };

    return (
        <ChatContext.Provider value={{ messages, isTyping, sendMessage, clearChat }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
}
