import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Role } from "../types";

// Helper to get client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing from environment variables.");
    // In a real app, we might handle this more gracefully, but for now we proceed.
    // The SDK will throw if initialized without key if strictly enforced, 
    // or the call will fail.
  }
  return new GoogleGenAI({ apiKey: apiKey });
};

export class GeminiService {
  private chat: Chat | null = null;
  private model: string = "gemini-2.5-flash"; // Fast model for chat

  constructor() {
    this.initChat();
  }

  private initChat() {
    const ai = getClient();
    this.chat = ai.chats.create({
      model: this.model,
      config: {
        systemInstruction: "You are a helpful, concise, and friendly AI assistant. You format your answers using Markdown. You prefer a professional but approachable tone.",
      }
    });
  }

  public async sendMessageStream(
    message: string, 
    onChunk: (text: string) => void
  ): Promise<string> {
    if (!this.chat) {
      this.initChat();
    }

    if (!this.chat) throw new Error("Failed to initialize chat");

    let fullText = "";
    
    try {
      const resultStream = await this.chat.sendMessageStream({ message });
      
      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullText += c.text;
          onChunk(fullText);
        }
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }

    return fullText;
  }

  public async recognizeImage(base64Image: string): Promise<{ language: string; text: string }> {
    const ai = getClient();
    
    try {
        const response = await ai.models.generateContent({
            model: this.model,
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: 'Analyze the image and extract all visible text. Identify the primary language. Output strictly valid JSON with keys "language" and "text". Do not include Markdown formatting.' }
                ]
            },
            config: {
                responseMimeType: 'application/json'
            }
        });

        let resultText = response.text || "{}";
        resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
            return JSON.parse(resultText);
        } catch (parseError) {
             const jsonMatch = resultText.match(/\{[\s\S]*\}/);
             if (jsonMatch) {
                 return JSON.parse(jsonMatch[0]);
             }
             throw parseError;
        }

    } catch (e) {
        console.error("OCR Error:", e);
        return { language: "Error", text: "识别失败，请重试。" };
    }
  }

  public async extractTodos(content: { text?: string; imageBase64?: string }): Promise<string[]> {
    const ai = getClient();
    const prompt = `
        You are an intelligent "Memory Potato" assistant. 
        Your task is to extract actionable Todo items from the provided input (which could be chat history, a voice note transcript, or a photo of a note).
        
        Rules:
        1. Identify distinct tasks or reminders.
        2. Format them as short, clear, actionable phrases (e.g., "Buy milk", "Meeting with John at 3 PM").
        3. Ignore irrelevant conversational filler.
        4. Return STRICTLY a valid JSON Array of strings. Example: ["Task 1", "Task 2"].
        5. If the input is in Chinese, return the tasks in Chinese.
    `;

    try {
        const parts: any[] = [{ text: prompt }];
        
        if (content.imageBase64) {
            parts.push({ inlineData: { mimeType: 'image/jpeg', data: content.imageBase64 } });
        }
        if (content.text) {
            parts.push({ text: `Input Text:\n${content.text}` });
        }

        const response = await ai.models.generateContent({
            model: this.model,
            contents: { parts },
            config: { responseMimeType: 'application/json' }
        });

        let resultText = response.text || "[]";
        resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const arr = JSON.parse(resultText);
            if (Array.isArray(arr)) {
                return arr.map(String);
            }
            return [];
        } catch (parseError) {
             console.error("JSON Parse Error", parseError);
             const jsonMatch = resultText.match(/\[[\s\S]*\]/);
             if (jsonMatch) {
                 return JSON.parse(jsonMatch[0]);
             }
             return [];
        }
    } catch (e) {
        console.error("Extract Todo Error:", e);
        return [];
    }
  }

  public resetSession() {
    this.initChat();
  }
}

export const geminiService = new GeminiService();