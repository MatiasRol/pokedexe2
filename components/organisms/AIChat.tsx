import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { askGemini } from '@/lib/modules/ai/services/gemini';

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
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const scrollViewRef           = useRef<ScrollView>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const welcome = pokemonName
        ? `¡Hola! Soy tu asistente Pokémon. Puedo responder preguntas sobre ${pokemonName} o cualquier otro Pokémon. ¿Qué quieres saber?`
        : '¡Hola! Soy tu asistente Pokémon. ¿Qué quieres saber sobre Pokémon?';
      setMessages([{ role: 'assistant', content: welcome }]);
    }
  }, [pokemonName]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const context = pokemonName
        ? `Pokémon actual: ${pokemonName} (Tipos: ${pokemonTypes?.join(', ')})`
        : undefined;
      const response = await askGemini(userMessage, context);
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (error: any) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: `❌ ${error.message ?? 'Error al procesar tu pregunta.'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden">
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

        <ScrollView ref={scrollViewRef} className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {messages.map((message, index) => (
            <View key={index} className={`mb-3 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
              <View className={`max-w-[80%] p-3 rounded-2xl ${message.role === 'user' ? 'bg-purple-500' : 'bg-gray-200'}`}>
                <Text className={message.role === 'user' ? 'text-white' : 'text-gray-800'}>
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
