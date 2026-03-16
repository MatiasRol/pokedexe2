const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
 
export async function askGemini(
  prompt: string,
  context?: string
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
 
  if (!apiKey) {
    return '⚠️ No hay API Key de Gemini configurada en .env';
  }
 
  const text = context
    ? `${context}\n\nResponde en español de forma breve y amigable.\n\nPregunta: ${prompt}`
    : `Eres un experto en Pokémon. Responde en español de forma breve y amigable.\n\nPregunta: ${prompt}`;
 
  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
      }),
    });
 
    const data = await res.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      '❌ No se pudo obtener respuesta.'
    );
  } catch (error) {
    console.error('ERROR GEMINI:', error);
    return '⚠️ Error al conectar con la IA.';
  }
}