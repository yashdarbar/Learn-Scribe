import { GoogleGenerativeAI } from "@google/generative-ai";

let geminiClient: GoogleGenerativeAI | null = null;

export function getGeminiClient() {
  if (!geminiClient) {
    // const apiKey = process.env.GEMINI_API_KEY;
    const apiKey = "AIzaSyCpWe5QqOrBk4Lvzcb1T1sAd-nuJwwpors";
    console.log("key0", apiKey);
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set in environment variables");
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}