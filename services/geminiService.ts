
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSecurity = async (content: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a privacy audit on this diary entry. Identify any PII (Personally Identifiable Information) or sensitive details that might be risky if the vault was compromised. Return a security score from 1-100 and suggestions for safer writing. Entry: "${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            securityScore: { type: Type.NUMBER },
            suggestions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            privacyThreats: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["securityScore", "suggestions", "privacyThreats"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Audit failed:", error);
    return null;
  }
};
