import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import LoadingSpinner from '../components/LoadingSpinner';
import StatBar from '../components/StatBar';
import TypeBadge from '../components/TypeBadge';
import { usePokemon } from '../hooks/usePokemon';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PokedexScreen() {
  const router = useRouter();
  const { pokemon, loading, error, setPokemonId } = usePokemon(25);
  const [searchInput, setSearchInput] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [iaVisible, setIaVisible] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [iaLoading, setIaLoading] = useState(false);

  // Animación del panel lateral
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  const toggleIA = () => {
    if (iaVisible) {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start(() => setIaVisible(false));
    } else {
      setIaVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    }
  };

  // Enviar mensaje a la IA
  const enviarMensaje = async () => {
    if (!API_KEY) {
      setMessages((prev) => [...prev, { role: 'ai', text: '⚠️ No hay API Key configurada.' }]);
      return;
    }
    if (!currentMessage.trim()) return;

    const pregunta = currentMessage.trim();
    setMessages((prev) => [...prev, { role: 'user', text: pregunta }]);
    setCurrentMessage('');
    setIaLoading(true);

    try {
      const contexto = pokemon
        ? `Contexto: El usuario está viendo a ${pokemon.name} (${pokemon.types.map(t => t.type.name).join(', ')}). `
        : '';

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${contexto}Eres un experto en Pokémon. Responde de forma breve y amigable en español.\n\nPregunta: ${pregunta}`
              }]
            }],
          }),
        }
      );
      const data = await res.json();
      const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text || '❌ No se pudo obtener respuesta.';
      setMessages((prev) => [...prev, { role: 'ai', text: texto }]);
    } catch (err) {
      console.error('Error IA:', err);
      setMessages((prev) => [...prev, { role: 'ai', text: '⚠️ Error al conectar con la IA.' }]);
    } finally {
      setIaLoading(false);
    }
  };

  // Funciones de Pokédex
  const handleSearch = () => {
    const searchValue = searchInput.toLowerCase().trim();
    if (searchValue) {
      setPokemonId(searchValue);
      setSearchInput('');
    }
  };

  const handlePrevious = () => {
    if (pokemon && pokemon.id > 1) setPokemonId(pokemon.id - 1);
  };

  const handleNext = () => {
    if (pokemon && pokemon.id < 1000) setPokemonId(pokemon.id + 1);
  };

  const handleRandom = () => {
    const randomId = Math.floor(Math.random() * 898) + 1;
    setPokemonId(randomId);
  };

  const toggleFavorite = () => {
    if (!pokemon) return;
    if (favorites.includes(pokemon.id)) setFavorites(favorites.filter(id => id !== pokemon.id));
    else setFavorites([...favorites, pokemon.id]);
  };

  const isFavorite = pokemon && favorites.includes(pokemon.id);

  return (
    <View className="flex-1 bg-red-600">
      {/* POKÉDEX PRINCIPAL */}
      <ScrollView className="flex-1">
        <View className="p-4 max-w-2xl mx-auto w-full">
          
          {/* HEADER */}
          <View className="bg-gradient-to-b from-red-600 to-red-700 rounded-3xl shadow-2xl p-6 mb-2 mt-8 border-4 border-red-800">
            {/* Luces superiores */}
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-16 h-16 bg-blue-400 rounded-full border-4 border-blue-600 shadow-lg" />
              <View className="w-4 h-4 bg-red-400 rounded-full border-2 border-red-600" />
              <View className="w-4 h-4 bg-yellow-400 rounded-full border-2 border-yellow-600" />
              <View className="w-4 h-4 bg-green-400 rounded-full border-2 border-green-600" />
            </View>

            {/* Título y controles */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-3xl font-bold text-white drop-shadow-lg">POKÉDEX</Text>

              <View className="flex-row gap-2">
                {/* Botón IA */}
                <TouchableOpacity
                  onPress={toggleIA}
                  className="bg-purple-600 px-5 py-3 rounded-2xl border-2 border-purple-800 shadow-lg"
                >
                  <Text className="text-white font-bold text-base">🤖 IA</Text>
                </TouchableOpacity>

                {/* Favoritos */}
                <View className="flex-row items-center gap-2 bg-pink-500 px-4 py-3 rounded-2xl border-2 border-pink-700 shadow-lg">
                  <Text className="text-white text-lg">❤️</Text>
                  <Text className="font-bold text-white text-base">{favorites.length}</Text>
                </View>
              </View>
            </View>

            {/* Barra de búsqueda */}
            <View className="flex-row gap-2">
              <TextInput
                value={searchInput}
                onChangeText={setSearchInput}
                onSubmitEditing={handleSearch}
                placeholder="Buscar por nombre o #ID"
                placeholderTextColor="#9CA3AF"
                className="flex-1 px-5 py-4 bg-white rounded-2xl border-3 border-gray-300 font-semibold text-base shadow-md"
              />
              <TouchableOpacity
                onPress={handleSearch}
                className="bg-blue-500 px-6 py-4 rounded-2xl border-2 border-blue-700 shadow-lg items-center justify-center"
              >
                <Text className="text-white font-bold text-xl">🔍</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* PANTALLA PRINCIPAL (Game Boy style) */}
          <View className="bg-gray-800 rounded-3xl shadow-2xl p-6 border-4 border-gray-900">
            <View className="bg-green-100 rounded-2xl p-4 border-4 border-green-900 shadow-inner">
              {loading && <LoadingSpinner />}

              {error && (
                <View className="items-center py-12">
                  <Text className="text-red-700 font-bold text-xl mb-4">⚠️ {error}</Text>
                  <TouchableOpacity
                    onPress={handleRandom}
                    className="bg-red-600 px-6 py-3 rounded-2xl border-2 border-red-800 shadow-lg"
                  >
                    <Text className="text-white font-bold text-base">🎲 Pokémon Aleatorio</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!loading && !error && pokemon && (
                <View>
                  {/* Imagen del Pokémon */}
                  <View className="bg-white rounded-3xl p-6 mb-4 relative shadow-lg border-2 border-gray-300">
                    <TouchableOpacity
                      onPress={toggleFavorite}
                      className="absolute top-3 right-3 bg-pink-100 rounded-full p-3 shadow-lg z-10 border-2 border-pink-300"
                    >
                      <Text className="text-3xl">{isFavorite ? '❤️' : '🤍'}</Text>
                    </TouchableOpacity>

                    <Image
                      source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
                      style={{ width: 240, height: 240 }}
                      className="mx-auto"
                      resizeMode="contain"
                    />
                  </View>

                  {/* Info del Pokémon */}
                  <View className="items-center mb-4 bg-white rounded-2xl p-4 shadow-md border-2 border-gray-300">
                    <Text className="text-gray-600 font-bold text-lg">
                      #{String(pokemon.id).padStart(3, '0')}
                    </Text>
                    <Text className="text-4xl font-bold text-gray-900 capitalize mb-3">
                      {pokemon.name}
                    </Text>
                    
                    {/* Tipos */}
                    <View className="flex-row gap-2">
                      {pokemon.types.map((type) => (
                        <TypeBadge key={type.type.name} type={type.type.name} />
                      ))}
                    </View>

                    {/* Botón pregunta IA */}
                    <TouchableOpacity
                      onPress={() => {
                        toggleIA();
                        setMessages([{ 
                          role: 'ai', 
                          text: `¡Hola! Puedo responder preguntas sobre ${pokemon.name}. ¿Qué quieres saber?` 
                        }]);
                      }}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-2xl items-center mt-4 mb-4 border-2 border-purple-800 shadow-lg"
                    >
                      <Text className="text-white font-bold text-base">
                        🤖 Pregunta a la IA sobre {pokemon.name}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Estadísticas */}
                  <View className="bg-blue-50 rounded-2xl p-5 mb-4 border-2 border-blue-200 shadow-md">
                    <Text className="text-xl font-bold text-blue-900 mb-3">⚡ Estadísticas</Text>
                    {pokemon.stats.map((stat) => (
                      <StatBar key={stat.stat.name} name={stat.stat.name} value={stat.base_stat} />
                    ))}
                  </View>

                  {/* Info adicional */}
                  <View className="flex-row gap-3 mb-4">
                    <View className="flex-1 bg-yellow-100 rounded-2xl p-4 items-center border-2 border-yellow-300 shadow-md">
                      <Text className="text-3xl mb-1">⚖️</Text>
                      <Text className="text-2xl font-bold text-gray-800">
                        {(pokemon.weight / 10).toFixed(1)}
                      </Text>
                      <Text className="text-xs text-gray-600 font-bold">KG</Text>
                    </View>
                    
                    <View className="flex-1 bg-green-100 rounded-2xl p-4 items-center border-2 border-green-300 shadow-md">
                      <Text className="text-3xl mb-1">📏</Text>
                      <Text className="text-2xl font-bold text-gray-800">
                        {(pokemon.height / 10).toFixed(1)}
                      </Text>
                      <Text className="text-xs text-gray-600 font-bold">M</Text>
                    </View>
                    
                    <View className="flex-1 bg-purple-100 rounded-2xl p-4 items-center border-2 border-purple-300 shadow-md">
                      <Text className="text-3xl mb-1">✨</Text>
                      <Text className="text-2xl font-bold text-gray-800">
                        {pokemon.abilities.length}
                      </Text>
                      <Text className="text-xs text-gray-600 font-bold">HABILIDADES</Text>
                    </View>
                  </View>

                  {/* Habilidades */}
                  <View className="bg-orange-50 rounded-2xl p-4 mb-4 border-2 border-orange-200 shadow-md">
                    <Text className="text-sm font-bold text-orange-900 mb-2">🎯 Habilidades:</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {pokemon.abilities.map((ability) => (
                        <View key={ability.ability.name} className="bg-orange-200 px-4 py-2 rounded-xl border border-orange-400">
                          <Text className="text-orange-900 text-sm font-bold capitalize">
                            {ability.ability.name.replace('-', ' ')}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Navegación */}
                  <View className="flex-row gap-2 mb-6">
                    <TouchableOpacity
                      onPress={handlePrevious}
                      disabled={pokemon.id <= 1}
                      className={`flex-1 py-4 rounded-2xl items-center border-2 shadow-lg ${
                        pokemon.id <= 1 
                          ? 'bg-gray-300 border-gray-400' 
                          : 'bg-blue-500 border-blue-700'
                      }`}
                    >
                      <Text className={`font-bold text-base ${
                        pokemon.id <= 1 ? 'text-gray-500' : 'text-white'
                      }`}>
                        ← Anterior
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={handleRandom}
                      className="flex-1 bg-green-500 py-4 rounded-2xl items-center border-2 border-green-700 shadow-lg"
                    >
                      <Text className="text-white font-bold text-base">🎲 Aleatorio</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={handleNext}
                      disabled={pokemon.id >= 1000}
                      className={`flex-1 py-4 rounded-2xl items-center border-2 shadow-lg ${
                        pokemon.id >= 1000 
                          ? 'bg-gray-300 border-gray-400' 
                          : 'bg-blue-500 border-blue-700'
                      }`}
                    >
                      <Text className={`font-bold text-base ${
                        pokemon.id >= 1000 ? 'text-gray-500' : 'text-white'
                      }`}>
                        Siguiente →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Footer */}
          <View className="items-center mt-6 pb-8">
            <Text className="text-white text-sm font-bold drop-shadow-lg">
              🎮 Pokédex Clásica con IA
            </Text>
            <Text className="text-white text-xs mt-1 opacity-90">
              {favorites.length} Pokémon favoritos • Powered by Gemini AI
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* PANEL LATERAL IA (50% ancho, blanco) */}
      {iaVisible && (
        <Animated.View
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: SCREEN_WIDTH * 0.5,
            transform: [{ translateX: slideAnim }],
          }}
          className="bg-white shadow-2xl rounded-l-3xl p-4 border-l-4 border-blue-900"
        >
          {/* Header del chat */}
          <View className="flex-row justify-between items-center mb-4 bg-blue-800 rounded-2xl p-3 border-2 border-blue-900">
            <Text className="text-xl font-bold text-white">🤖 Asistente IA</Text>
            <TouchableOpacity
              onPress={toggleIA}
              className="bg-red-500 rounded-full w-8 h-8 items-center justify-center border-2 border-red-700"
            >
              <Text className="text-white font-bold text-lg">✖</Text>
            </TouchableOpacity>
          </View>

          {/* Mensajes */}
          <ScrollView className="flex-1 mb-3 bg-white rounded-2xl p-3 border-2 border-gray-300">
            {messages.length === 0 && (
              <View className="items-center justify-center py-8">
                <Text className="text-4xl mb-2">🤖</Text>
                <Text className="text-gray-500 text-center font-semibold">
                  ¡Hola! Pregunta sobre Pokémon
                </Text>
              </View>
            )}

            {messages.map((msg, index) => (
              <View
                key={index}
                className={`my-2 px-4 py-3 rounded-2xl max-w-[85%] shadow-md ${
                  msg.role === 'user'
                    ? 'bg-purple-600 self-end border-2 border-purple-800'
                    : 'bg-gray-100 self-start border-2 border-gray-300'
                }`}
              >
                <Text className={`${
                  msg.role === 'user' ? 'text-white' : 'text-gray-900'
                } font-medium`}>
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
          <View className="flex-row gap-2">
            <TextInput
              value={currentMessage}
              onChangeText={setCurrentMessage}
              onSubmitEditing={enviarMensaje}
              placeholder="Escribe tu pregunta..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 bg-white border-2 border-purple-300 rounded-2xl px-4 py-3 font-medium shadow-md"
            />
            <TouchableOpacity
              onPress={enviarMensaje}
              disabled={!currentMessage.trim() || iaLoading}
              className={`px-5 py-3 rounded-2xl border-2 shadow-lg ${
                !currentMessage.trim() || iaLoading
                  ? 'bg-gray-400 border-gray-500'
                  : 'bg-purple-600 border-purple-800'
              }`}
            >
              <Text className="text-white font-bold text-xl">
                {iaLoading ? '⏳' : '➤'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}