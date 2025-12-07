import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResponse } from "../types";

const SYSTEM_PROMPT = `
You are an elite institutional Forex and Crypto analyst specializing in ICT (Inner Circle Trader) and SMC (Smart Money Concepts).
Analyze the chart image provided.

Identify:
1. **Strategy**: Name the specific setup (e.g., "ICT Silver Bullet", "Unicorn Model", "Order Block Rejection", "FVG Displacement", "Break & Retest").
2. **Confidence**: Give a confidence score (0-100) based on the clarity of market structure and confluence factors.
3. **Breakdown**: Provide a concise, step-by-step bullet point breakdown of why this trade is valid.
4. **Trade Setup**: Provide Entry, SL, and realistic targets.

IMPORTANT FORMATTING RULES:
- **Direction**: MUST be exactly "BUY" or "SELL". DO NOT use "Long" or "Short".
- **Reasoning**: Keep it professional and concise.

CRITICAL: 
- Your goal is to ALWAYS find a valid trade setup if there is a price chart visible.
- If the image is clearly NOT a trading chart, return isSetupValid: false.
- Focus on high R:R setups.
`;

export const analyzeChartWithGemini = async (base64Image: string, userApiKey?: string): Promise<AIAnalysisResponse> => {
  try {
    const apiKey = userApiKey || process.env.API_KEY;

    if (!apiKey) {
      throw new Error("API Key not configured");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Using flash for speed
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
            direction: { type: Type.STRING, description: "Must be 'BUY' or 'SELL'" },
            entry: { type: Type.NUMBER },
            sl: { type: Type.NUMBER },
            tp1: { type: Type.NUMBER },
            tp2: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            isSetupValid: { type: Type.BOOLEAN },
            marketStructure: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 100" },
            strategy: { type: Type.STRING, description: "Name of the strategy used" },
            breakdown: { type: Type.STRING, description: "Concise step-by-step analysis" }
          },
          required: ["pair", "timeframe", "direction", "entry", "sl", "tp1", "tp2", "reasoning", "isSetupValid", "marketStructure", "confidence", "strategy", "breakdown"],
        },
        temperature: 0.4, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text) as AIAnalysisResponse;
    
    // Fallback enforcement just in case model slips up
    if (data.direction.toUpperCase().includes("LONG")) data.direction = "BUY";
    if (data.direction.toUpperCase().includes("SHORT")) data.direction = "SELL";
    data.direction = data.direction.toUpperCase();

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
      marketStructure: [],
      confidence: 0,
      strategy: "N/A",
      breakdown: "Analysis failed."
    };
  }
};