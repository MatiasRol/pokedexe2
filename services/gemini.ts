import { GoogleGenerativeAI } from '@google/generative-ai';

// ⚠️ Reemplaza esto con tu API Key REAL de Google AI Studio
const API_KEY = 'AIzaSyBhF2s61um8wje4aBKgZbguNEvKTQxzhRM'; // Tu API Key completa aquí

const genAI = new GoogleGenerativeAI(API_KEY);

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const askGemini = async (question: string, pokemonContext?: string): Promise<string> => {
  try {
    // Verificar que la API Key existe
    if (!API_KEY || API_KEY === 'AIzaSyBhF2s61um8wje4aBKgZbguNEvKTQxzhRM') {
      throw new Error('API Key no configurada. Por favor configura tu API Key en services/gemini.ts');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Contexto mejorado si hay un Pokémon activo
    const context = pokemonContext 
      ? `Eres un experto en Pokémon. El usuario está viendo: ${pokemonContext}. Responde de manera breve y amigable en español.`
      : 'Eres un experto en Pokémon. Responde de manera breve y amigable en español.';

    const prompt = `${context}\n\nPregunta del usuario: ${question}`;

    console.log('Enviando pregunta a Gemini:', question); // Para debug

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Respuesta recibida:', text); // Para debug

    return text;
  } catch (error: any) {
    console.error('Error detallado en Gemini:', error);
    
    // Mensajes de error más específicos
    if (error.message?.includes('API key')) {
      throw new Error('API Key inválida. Verifica tu API Key en Google AI Studio.');
    } else if (error.message?.includes('quota')) {
      throw new Error('Límite de cuota alcanzado. Espera unos minutos e intenta de nuevo.');
    } else if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('API Key inválida o expirada. Genera una nueva en Google AI Studio.');
    } else {
      throw new Error(`Error: ${error.message || 'No se pudo obtener respuesta de la IA'}`);
    }
  }
};

export const askAboutPokemon = async (pokemonName: string, question: string): Promise<string> => {
  const context = `El usuario pregunta sobre ${pokemonName}`;
  return askGemini(question, context);
};