/**
 * 🤖 IAPanelLateral.tsx — Organismo
 *
 * Panel lateral de IA extraído de pokedex.tsx.
 * Antes estaba duplicado (panel lateral + pantalla ai-chat.tsx).
 * Ahora ambos usan el mismo componente AIChat de organisms/.
 */

import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { askGemini } from '@/lib/modules/ai/services/gemini';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface IAPanelLateralProps {
  pokemonName?: string;
  pokemonTypes?: string[];
  initialMessage?: string;
  onClose: () => void;
}

export default function IAPanelLateral({
  pokemonName,
  pokemonTypes,
  initialMessage,
  onClose,
}: IAPanelLateralProps) {
  const [messages, setMessages]           = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [iaLoading, setIaLoading]         = useState(false);
  const scrollRef                         = useRef<ScrollView>(null);

  // Animación de entrada
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    // Mensaje inicial
    const welcome = initialMessage
      ?? (pokemonName
        ? `¡Hola! Puedo responder preguntas sobre ${pokemonName}. ¿Qué quieres saber?`
        : '¡Hola! Pregunta cualquier cosa sobre Pokémon.');
    setMessages([{ role: 'ai', text: welcome }]);

    // Animar entrada
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(() => onClose());
  };

  const enviar = async () => {
    if (!currentMessage.trim() || iaLoading) return;

    const pregunta = currentMessage.trim();
    setMessages(prev => [...prev, { role: 'user', text: pregunta }]);
    setCurrentMessage('');
    setIaLoading(true);

    try {
      const context = pokemonName
        ? `Pokémon actual: ${pokemonName} (Tipos: ${pokemonTypes?.join(', ')}). Responde en español de forma breve.`
        : 'Responde en español de forma breve sobre Pokémon.';

      const respuesta = await askGemini(pregunta, context);
      setMessages(prev => [...prev, { role: 'ai', text: respuesta }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Error al conectar con la IA.' }]);
    } finally {
      setIaLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <Animated.View
      style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        width: SCREEN_WIDTH * 0.75,
        transform: [{ translateX: slideAnim }],
      }}
      className="bg-white shadow-2xl rounded-l-3xl border-l-4 border-blue-900"
    >
      {/* Header */}
      <View className="flex-row justify-between items-center bg-blue-800 rounded-tl-3xl p-4 border-b border-blue-900">
        <View>
          <Text className="text-white font-bold text-base">🤖 Asistente IA</Text>
          {pokemonName && (
            <Text className="text-blue-300 text-xs mt-0.5 capitalize">{pokemonName}</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={handleClose}
          className="bg-red-500 rounded-full w-8 h-8 items-center justify-center border-2 border-red-700"
        >
          <Text className="text-white font-bold">✕</Text>
        </TouchableOpacity>
      </View>

      {/* Mensajes */}
      <ScrollView
        ref={scrollRef}
        className="flex-1 p-3"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            className={`my-2 px-4 py-3 rounded-2xl max-w-[90%] ${
              msg.role === 'user'
                ? 'bg-purple-600 self-end border-2 border-purple-800'
                : 'bg-gray-100 self-start border-2 border-gray-200'
            }`}
          >
            <Text className={msg.role === 'user' ? 'text-white font-medium' : 'text-gray-900 font-medium'}>
              {msg.text}
            </Text>
          </View>
        ))}
        {iaLoading && (
          <View className="self-start bg-gray-200 px-4 py-3 rounded-2xl my-2 border-2 border-gray-300">
            <ActivityIndicator color="#7c3aed" />
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View className="p-3 border-t border-gray-200 flex-row gap-2">
        <TextInput
          value={currentMessage}
          onChangeText={setCurrentMessage}
          onSubmitEditing={enviar}
          placeholder="Escribe tu pregunta..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 bg-gray-50 border-2 border-purple-200 rounded-2xl px-4 py-3 font-medium"
        />
        <TouchableOpacity
          onPress={enviar}
          disabled={!currentMessage.trim() || iaLoading}
          className={`px-4 py-3 rounded-2xl border-2 items-center justify-center ${
            !currentMessage.trim() || iaLoading
              ? 'bg-gray-300 border-gray-400'
              : 'bg-purple-600 border-purple-800'
          }`}
        >
          <Text className="text-white font-bold text-lg">
            {iaLoading ? '⏳' : '➤'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}