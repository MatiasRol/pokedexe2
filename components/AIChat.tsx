import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { askGemini } from '../services/gemini';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  pokemonName?: string;
  pokemonTypes?: string[];
}

export default function AIChat({ pokemonName, pokemonTypes }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Mensaje de bienvenida
    if (messages.length === 0) {
      const welcomeMessage = pokemonName
        ? `¡Hola! Soy tu asistente Pokémon. Puedo responder preguntas sobre ${pokemonName} o cualquier otro Pokémon. ¿Qué quieres saber?`
        : '¡Hola! Soy tu asistente Pokémon. ¿Qué quieres saber sobre Pokémon?';
      
      setMessages([{ role: 'assistant', content: welcomeMessage }]);
    }
  }, [pokemonName]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Agregar mensaje del usuario
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Crear contexto con información del Pokémon actual
      const context = pokemonName 
        ? `Pokémon actual: ${pokemonName} (Tipos: ${pokemonTypes?.join(', ')})`
        : undefined;

      console.log('Pregunta:', userMessage);
      console.log('Contexto:', context);

      const response = await askGemini(userMessage, context);

      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (error: any) {
      console.error('Error completo:', error);
      
      const errorMessage = error.message || 'Lo siento, hubo un error al procesar tu pregunta.';
      
      setMessages([
        ...newMessages,
        { 
          role: 'assistant', 
          content: `❌ ${errorMessage}\n\nPor favor verifica:\n• Tu API Key esté correctamente configurada\n• Tengas conexión a internet\n• No hayas excedido el límite de solicitudes` 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-scroll al último mensaje
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <View className="bg-purple-500 p-4">
          <Text className="text-white text-xl font-bold text-center">
            🤖 Asistente Pokémon IA
          </Text>
          {pokemonName && (
            <Text className="text-white text-sm text-center mt-1 opacity-90">
              Pregúntame sobre {pokemonName}
            </Text>
          )}
        </View>

        {/* Chat Messages */}
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              className={`mb-3 ${
                message.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <View
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-purple-500'
                    : 'bg-gray-200'
                }`}
              >
                <Text
                  className={`${
                    message.role === 'user' ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {message.content}
                </Text>
              </View>
              <Text className="text-xs text-gray-400 mt-1 px-2">
                {message.role === 'user' ? 'Tú' : 'Asistente IA'}
              </Text>
            </View>
          ))}

          {loading && (
            <View className="items-start mb-3">
              <View className="bg-gray-200 p-3 rounded-2xl flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#a855f7" />
                <Text className="text-gray-600">Pensando...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View className="border-t border-gray-200 p-4">
          <View className="flex-row gap-2">
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              placeholder="Pregunta algo sobre Pokémon..."
              className="flex-1 px-4 py-3 bg-gray-100 rounded-full"
              multiline
              maxLength={500}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() || loading}
              className={`px-6 py-3 rounded-full items-center justify-center ${
                !input.trim() || loading ? 'bg-gray-300' : 'bg-purple-500'
              }`}
            >
              <Text className="text-white font-bold text-lg">
                {loading ? '⏳' : '📤'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
