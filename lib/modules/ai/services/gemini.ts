const API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ??
  'AIzaSyBhF2s61um8wje4aBKgZbguNEvKTQxzhRM';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function askGemini(
  prompt: string,
  context?: string
): Promise<string> {
  const text = context
    ? `${context}\n\nResponde en español de forma breve y amigable.\n\nPregunta: ${prompt}`
    : `Eres un experto en Pokémon. Responde en español de forma breve y amigable.\n\nPregunta: ${prompt}`;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
      }),
    });

    const data = await res.json();

    if (data.error) {
      return `❌ Error: ${data.error.message}`;
    }

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      '❌ No se pudo obtener respuesta.'
    );
  } catch (error) {
    return '⚠️ Error al conectar con la IA.';
  }
}