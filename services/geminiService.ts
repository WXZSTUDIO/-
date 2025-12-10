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

  public resetSession() {
    this.initChat();
  }
}

export const geminiService = new GeminiService();
