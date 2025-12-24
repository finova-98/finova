import axios from "axios";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_VISION_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";
const GEMINI_CHAT_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

/**
 * Extract invoice data from image using Google Gemini Vision API
 * @param base64Image - Base64 encoded image data
 * @returns Extracted invoice data as JSON string
 */
export async function extractInvoiceWithGemini(base64Image: string): Promise<string> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your-gemini-api-key") {
    throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file");
  }

  try {
    // Remove data URL prefix if present
    const imageData = base64Image.includes(',') 
      ? base64Image.split(',')[1] 
      : base64Image;

    const response = await axios.post<GeminiResponse>(
      `${GEMINI_VISION_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are an expert AI specialized in extracting structured data from invoice and receipt images with high accuracy.

INSTRUCTIONS:
1. Carefully analyze the entire invoice/receipt image
2. Extract ALL visible information accurately
3. Look for these specific fields:
   - Vendor/Company name (usually at the top, in larger text)
   - Invoice number (may be labeled as "Invoice #", "Invoice No.", "Receipt #", etc.)
   - Date (look for "Date", "Invoice Date", "Issued Date", etc.)
   - Line items in a table format (Description/Item Name, Quantity/Qty, Unit Price/Rate, Amount)
   - Tax amounts (GST, VAT, Sales Tax, etc.)
   - Subtotal and Total amounts
   - Any special notes or terms

4. For line items, extract:
   - Complete description (don't truncate)
   - Exact quantity (if not shown, assume 1)
   - Unit price (price per item, not total)

5. Return ONLY a JSON object in this EXACT format with no additional text:
{
  "vendor": "exact company name from invoice",
  "invoiceNumber": "exact invoice/receipt number",
  "date": "YYYY-MM-DD format",
  "tax": 0,
  "notes": "any terms, conditions, or special notes",
  "items": [
    {
      "description": "exact item/service description",
      "quantity": 0,
      "price": 0
    }
  ]
}

IMPORTANT:
- If a field is not visible or unclear, use empty string "" for text fields and 0 for numbers
- Ensure numbers are actual numbers, not strings
- Date must be in YYYY-MM-DD format (convert if needed)
- Extract ALL line items, not just the first one
- Be precise with decimal values`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageData
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.candidates && response.data.candidates.length > 0) {
      const text = response.data.candidates[0].content.parts[0].text;
      return text;
    } else {
      throw new Error("No response from Gemini API");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(`Gemini API Error: ${errorMessage}`);
    }
    throw error;
  }
}

/**
 * Send chat message to Gemini API
 * @param messages - Array of chat messages with role and content
 * @returns Response from Gemini
 */
export async function sendChatMessage(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your-gemini-api-key") {
    throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file");
  }

  try {
    // Convert messages to Gemini format
    // Gemini uses 'user' and 'model' roles instead of 'assistant'
    const geminiMessages = messages
      .filter(msg => msg.role !== "system") // Remove system messages
      .map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

    // Get system message if exists
    const systemMessage = messages.find(msg => msg.role === "system");
    
    // If there's a system message, prepend it to the first user message
    if (systemMessage && geminiMessages.length > 0 && geminiMessages[0].role === "user") {
      geminiMessages[0].parts[0].text = `${systemMessage.content}\n\n${geminiMessages[0].parts[0].text}`;
    }

    const response = await axios.post<GeminiResponse>(
      `${GEMINI_CHAT_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.candidates && response.data.candidates.length > 0) {
      const text = response.data.candidates[0].content.parts[0].text;
      return text;
    } else {
      throw new Error("No response from Gemini API");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(`Gemini API Error: ${errorMessage}`);
    }
    throw error;
  }
}
