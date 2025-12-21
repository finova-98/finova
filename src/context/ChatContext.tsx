
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendChatMessage, buildConversationHistory } from "@/lib/openrouter";
import { extractPDFText, isPDF, formatPDFTextForAI } from "@/lib/pdfParser";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";
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
    { symbol: "RELIANCE.BSE", name: "Reliance Industries" },
    { symbol: "TCS.BSE", name: "Tata Consultancy Svcs" },
    { symbol: "HDFCBANK.BSE", name: "HDFC Bank" },
    { symbol: "INFY.BSE", name: "Infosys Ltd" },
    { symbol: "ICICIBANK.BSE", name: "ICICI Bank" },
    { symbol: "TATAMOTORS.BSE", name: "Tata Motors" },
    { symbol: "SBIN.BSE", name: "State Bank of India" }
];

export function ChatProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isTyping, setIsTyping] = useState(false);
    const [marketContext, setMarketContext] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    // Load messages from Supabase
    useEffect(() => {
        if (user) {
            loadMessages();
        } else {
            setMessages(initialMessages);
        }
    }, [user]);

    const loadMessages = async () => {
        if (!user) return;
        
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            
            if (data && data.length > 0) {
                const loadedMessages: Message[] = data.map((msg: any) => ({
                    id: msg.id,
                    content: msg.content,
                    role: msg.role,
                    file: msg.file_name ? {
                        name: msg.file_name,
                        size: msg.file_size || 0
                    } : undefined
                }));
                setMessages([initialMessages[0], ...loadedMessages]);
            } else {
                setMessages(initialMessages);
            }
        } catch (error: any) {
            console.error('Error loading chat messages:', error);
            setMessages(initialMessages);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch Market Data Logic
    useEffect(() => {
        const fetchContextData = async () => {
            const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
            if (!apiKey) {
                setMarketContext("⚠️ Alpha Vantage API key not configured. Live market data unavailable.");
                return;
            }

            try {
                const promises = contextStocks.map(async (stock) => {
                    try {
                        const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.symbol}&apikey=${apiKey}`);
                        const quote = response.data['Global Quote'];
                        
                        if (quote && quote['05. price']) {
                            const price = parseFloat(quote['05. price']);
                            const prevClose = parseFloat(quote['08. previous close']);
                            const change = ((price - prevClose) / prevClose) * 100;
                            return `${stock.name} (${stock.symbol}): ₹${price.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}%)`;
                        }
                    } catch (e: any) {
                        // Silently handle 403 errors (API key issues or unsupported symbols)
                        if (e.response?.status === 403 || e.response?.status === 401) {
                            return null;
                        }
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                const validResults = results.filter(r => r !== null && r !== undefined);
                if (validResults.length > 0) {
                    setMarketContext(validResults.join("\n"));
                } else {
                    setMarketContext("⚠️ Market data unavailable. API rate limit may be exceeded (25 requests/day on free tier).");
                }
            } catch (err) {
                console.error("Failed to fetch market context", err);
                setMarketContext("⚠️ Error fetching market data. Please try again later.");
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
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: response,
                role: "assistant"
            };
            setMessages(prev => [...prev, assistantMessage]);

            // Save both messages to Supabase
            if (user) {
                try {
                    await supabase.from('chat_messages').insert([
                        {
                            user_id: user.id,
                            content: content || (file ? "I've uploaded an invoice for analysis" : ""),
                            role: "user",
                            file_name: file?.name || null,
                            file_size: file?.size || null
                        },
                        {
                            user_id: user.id,
                            content: response,
                            role: "assistant"
                        }
                    ]);
                } catch (dbError) {
                    console.error('Failed to save messages to database:', dbError);
                }
            }

        } catch (error) {
            setIsTyping(false);
            const msg = error instanceof Error ? error.message : "Error occurred";
            toast({ title: "Error", description: msg, variant: "destructive" });
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: `Error: ${msg}`,
                role: "assistant"
            };
            setMessages(prev => [...prev, errorMessage]);

            // Save error message to Supabase
            if (user) {
                try {
                    await supabase.from('chat_messages').insert([
                        {
                            user_id: user.id,
                            content: content || (file ? "I've uploaded an invoice for analysis" : ""),
                            role: "user",
                            file_name: file?.name || null,
                            file_size: file?.size || null
                        },
                        {
                            user_id: user.id,
                            content: `Error: ${msg}`,
                            role: "assistant"
                        }
                    ]);
                } catch (dbError) {
                    console.error('Failed to save error to database:', dbError);
                }
            }
        }
    };

    const clearChat = async () => {
        setMessages(initialMessages);
        
        if (user) {
            try {
                await supabase
                    .from('chat_messages')
                    .delete()
                    .eq('user_id', user.id);
            } catch (error) {
                console.error('Failed to clear chat from database:', error);
            }
        }
        
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
