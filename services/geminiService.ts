import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResponse } from "../types";

const SYSTEM_PROMPT = `
You are an expert Forex and Crypto technical analyst (ICT concepts).
Analyze the chart image provided.

Identify:
1. Trend & Structure (BOS, CHoCH)
2. Key Levels (FVG, Order Blocks)
3. Trade Setup (Entry, SL, TP)

IMPORTANT: Your goal is to ALWAYS find a valid trade setup if there is a price chart visible. 
Only return isSetupValid: false if the image is clearly NOT a trading chart (e.g. a selfie, a cat, a blank screen). 
If the setup is less clear, provide the best possible probability setup based on market structure.
`;

export const analyzeChartWithGemini = async (base64Image: string, userApiKey?: string): Promise<AIAnalysisResponse> => {
  try {
    const apiKey = userApiKey || process.env.API_KEY;

    if (!apiKey) {
      throw new Error("API Key not configured");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Using flash for speed, but allowing standard inference
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
        temperature: 0.4, // Increased slightly to allow pattern matching on less clear charts
        // thinkingConfig removed to allow standard model behavior which is more robust
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