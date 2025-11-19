// services/gemini.ts
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
});

export async function askGemini(prompt: string, context?: string): Promise<string> {
  try {
    const contents = context
      ? `${context}\n\nPregunta del usuario: ${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    return response.text ?? "No se recibió respuesta del modelo.";
  } catch (error) {
    console.error("ERROR GEMINI:", error);
    return "Ocurrió un error al procesar tu solicitud.";
  }
}
