import axios from "axios";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string | Array<{
        type: "text" | "image_url";
        text?: string;
        image_url?: {
            url: string;
        };
    }>;
}

export interface OpenRouterResponse {
    id: string;
    choices: {
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }[];
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

/**
 * Send a chat message with vision support to OpenRouter API
 * @param messages - Array of chat messages (can include images)
 * @param model - Model to use (default: mistralai/mistral-7b-instruct:free)
 * @returns Response from OpenRouter
 */
export async function sendChatMessageWithVision(
    messages: ChatMessage[],
    model: string = "google/gemini-2.0-flash-exp:free"
): Promise<string> {
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === "your_openrouter_api_key_here") {
        throw new Error("OpenRouter API key is not configured. Please add VITE_OPENROUTER_API_KEY to your .env file");
    }

    try {
        const response = await axios.post<OpenRouterResponse>(
            OPENROUTER_API_URL,
            {
                model: model,
                messages: messages,
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "AI Finance Chat",
                },
            }
        );

        if (response.data.choices && response.data.choices.length > 0) {
            return response.data.choices[0].message.content;
        } else {
            throw new Error("No response from OpenRouter");
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            throw new Error(`OpenRouter API Error: ${errorMessage}`);
        }
        throw error;
    }
}

/**
 * Send a chat message to OpenRouter API
 * @param messages - Array of chat messages
 * @param model - Model to use (default: mistralai/mistral-7b-instruct:free)
 * @returns Response from OpenRouter
 */
export async function sendChatMessage(
    messages: ChatMessage[],
    model: string = "mistralai/mistral-7b-instruct:free"
): Promise<string> {
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === "your_openrouter_api_key_here") {
        throw new Error("OpenRouter API key is not configured. Please add VITE_OPENROUTER_API_KEY to your .env file");
    }

    try {
        const response = await axios.post<OpenRouterResponse>(
            OPENROUTER_API_URL,
            {
                model: model,
                messages: messages,
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.origin, // Optional, for rankings
                    "X-Title": "AI Finance Chat", // Optional, shows in rankings
                },
            }
        );

        if (response.data.choices && response.data.choices.length > 0) {
            return response.data.choices[0].message.content;
        } else {
            throw new Error("No response from OpenRouter");
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            throw new Error(`OpenRouter API Error: ${errorMessage}`);
        }
        throw error;
    }
}

/**
 * Create a financial assistant system prompt
 */
/**
 * Create a financial assistant system prompt with optional market data
 */
export function getFinancialAssistantSystemPrompt(marketData?: string): string {
    let prompt = `You are an AI financial assistant specializing in helping users manage their finances, analyze invoices, track spending, and provide financial insights. 

Your capabilities include:
- Analyzing invoice data and extracting key information
- Tracking and categorizing expenses
- Providing spending summaries and trends
- Offering cost optimization suggestions
- Answering financial questions in a clear, helpful manner
- Providing stock market investment suggestions based on current market data

Always be:
- Professional yet friendly
- Clear and concise in your responses
- Accurate with financial data
- Helpful in providing actionable insights
- Supportive in helping users make better financial decisions

When analyzing invoices or expenses, provide structured information with clear breakdowns. Use formatting like bullet points and bold text for important information.`;

    if (marketData) {
        prompt += `\n\nCURRENT MARKET DATA (Use this to answer investment questions):\n${marketData}\n\nIf the user asks for investment advice (e.g., 'I have 10k, what should I invest in?'), analyze the provided market data. Suggest a diversified portfolio or specific stocks based on their performance (e.g., recommend stable stocks like Reliance or TCS for safety, or momentum stocks if they are rising). tailored to their amount.\n\nCRITICAL INSTRUCTIONS:\n1. CONTEXT: You are an expert on the INDIAN STOCK MARKET only.\n2. CURRENCY: STRICTLY use Indian Rupees (₹) for ALL monetary values. NEVER use the dollar sign ($) or USD. If the user mentions a generic number like "10k", assume it is ₹10,000.\n3. STOCKS: Only discuss companies listed on NSE/BSE (e.g., Reliance, TCS, HDFC, Infosys).\n\nAlways add a disclaimer that you are an AI and this is not professional financial advice.`;
    }

    return prompt;
}

/**
 * Build conversation history for OpenRouter
 */
export function buildConversationHistory(
    messages: { role: "user" | "assistant"; content: string }[],
    marketData?: string
): ChatMessage[] {
    const systemMessage: ChatMessage = {
        role: "system",
        content: getFinancialAssistantSystemPrompt(marketData),
    };

    const conversationMessages: ChatMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
    }));

    return [systemMessage, ...conversationMessages];
}
