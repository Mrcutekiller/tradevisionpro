import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResponse } from "../types";

const SYSTEM_PROMPT = `
You are an expert Forex and Crypto technical analyst (ICT concepts).
Analyze the chart image provided.

Identify:
1. Trend & Structure (BOS, CHoCH)
2. Key Levels (FVG, Order Blocks)
3. Trade Setup (Entry, SL, TP)

If valid, provide exact numbers. If invalid or unclear, set isSetupValid: false.
`;

export const analyzeChartWithGemini = async (base64Image: string): Promise<AIAnalysisResponse> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API Key not configured");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using flash for maximum speed
    const modelId = "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { text: SYSTEM_PROMPT },
          {
            inlineData: {
              mimeType: "image/png", 
              data: base64Image
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pair: { type: Type.STRING },
            timeframe: { type: Type.STRING },
            direction: { type: Type.STRING },
            entry: { type: Type.NUMBER },
            sl: { type: Type.NUMBER },
            tp1: { type: Type.NUMBER },
            tp2: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            isSetupValid: { type: Type.BOOLEAN },
            marketStructure: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["pair", "timeframe", "direction", "entry", "sl", "tp1", "tp2", "reasoning", "isSetupValid", "marketStructure"],
        },
        temperature: 0.1, // Minimal creativity for faster, deterministic output
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for lowest latency
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text) as AIAnalysisResponse;
    // Ensure marketStructure is always an array
    if (!data.marketStructure) data.marketStructure = [];
    
    return data;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Return a safe fallback error state
    return {
      pair: "UNKNOWN",
      timeframe: "N/A",
      direction: "N/A",
      entry: 0,
      sl: 0,
      tp1: 0,
      tp2: 0,
      reasoning: "Failed to analyze chart. Please try a clearer image.",
      isSetupValid: false,
      marketStructure: []
    };
  }
};