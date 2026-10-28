import axios from "axios";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

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

export interface GroqResponse {
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
 * Send a chat message with vision support to Groq API
 * @param messages - Array of chat messages (can include images)
 * @param model - Model to use (default: llama-4-maverick-17b-128e-instruct)
 * @returns Response from Groq
 */
export async function sendChatMessageWithVision(
    messages: ChatMessage[],
    model: string = "llama-4-maverick-17b-128e-instruct"
): Promise<string> {
    if (!GROQ_API_KEY || GROQ_API_KEY === "your_groq_api_key_here") {
        throw new Error("Groq API key is not configured. Please add VITE_GROQ_API_KEY to your .env file");
    }

    try {
        const response = await axios.post<GroqResponse>(
            GROQ_API_URL,
            {
                model: model,
                messages: messages,
                temperature: 0.1,
                max_tokens: 2048,
            },
            {
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.data.choices && response.data.choices.length > 0) {
            return response.data.choices[0].message.content;
        } else {
            throw new Error("No response from Groq");
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            throw new Error(`Groq API Error: ${errorMessage}`);
        }
        throw error;
    }
}

/**
 * Send a regular chat message to Groq API
 * @param messages - Array of chat messages
 * @param model - Model to use (default: llama-3.3-70b-versatile)
 * @returns Response from Groq
 */
export async function sendChatMessage(
    messages: ChatMessage[],
    model: string = "llama-3.3-70b-versatile"
): Promise<string> {
    if (!GROQ_API_KEY || GROQ_API_KEY === "your_groq_api_key_here") {
        throw new Error("Groq API key is not configured. Please add VITE_GROQ_API_KEY to your .env file");
    }

    try {
        const response = await axios.post<GroqResponse>(
            GROQ_API_URL,
            {
                model: model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 2048,
            },
            {
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.data.choices && response.data.choices.length > 0) {
            return response.data.choices[0].message.content;
        } else {
            throw new Error("No response from Groq");
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            throw new Error(`Groq API Error: ${errorMessage}`);
        }
        throw error;
    }
}
