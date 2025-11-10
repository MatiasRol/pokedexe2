import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LoadingSpinner from '../components/LoadingSpinner';
import StatBar from '../components/StatBar';
import TypeBadge from '../components/TypeBadge';
import { usePokemon } from '../hooks/usePokemon';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const router = useRouter();
  const { pokemon, loading, error, setPokemonId } = usePokemon(25);
  const [searchInput, setSearchInput] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [iaQuestion, setIaQuestion] = useState('');
  const [iaResponse, setIaResponse] = useState('');
  const [iaLoading, setIaLoading] = useState(false);
  const [iaVisible, setIaVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(screenWidth));

  // 🧠 Mostrar/Ocultar panel de IA
  const toggleIA = () => {
    if (iaVisible) {
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIaVisible(false));
    } else {
      setIaVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // 🧠 Consultar Gemini
  const consultarGemini = async () => {
    if (!API_KEY) {
      setIaResponse('⚠️ No hay API Key configurada.');
      return;
    }

    if (!iaQuestion.trim()) {
      setIaResponse('⚠️ Escribe una pregunta primero.');
      return;
    }

    setIaLoading(true);
    setIaResponse('');
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: iaQuestion }] }],
          }),
        }
      );

      const data = await res.json();
      const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (texto) setIaResponse(texto);
      else setIaResponse('❌ No se pudo obtener una respuesta.');
    } catch (err) {
      console.error('Error al consultar la IA:', err);
      setIaResponse('⚠️ Error al conectar con la IA.');
    } finally {
      setIaLoading(false);
    }
  };

  // 🔍 Funciones normales de Pokédex
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
    if (favorites.includes(pokemon.id))
      setFavorites(favorites.filter((id) => id !== pokemon.id));
    else setFavorites([...favorites, pokemon.id]);
  };

  const isFavorite = pokemon && favorites.includes(pokemon.id);

  return (
    <View className="flex-1 bg-red-500">
      {/* 📜 Scroll principal */}
      <ScrollView className="flex-1">
        <View className="p-4 max-w-2xl mx-auto w-full">
          {/* Header */}
          <View className="bg-white rounded-t-3xl shadow-2xl p-6 mb-1 mt-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-3xl font-bold text-gray-800">Pokédex</Text>

              <View className="flex-row gap-2">
                <View className="flex-row items-center gap-2 bg-red-500 px-4 py-2 rounded-full">
                  <Text className="text-white">❤️</Text>
                  <Text className="font-bold text-white">{favorites.length}</Text>
                </View>

                {/* 🤖 Botón para abrir/cerrar IA */}
                <TouchableOpacity
                  onPress={toggleIA}
                  className="bg-purple-500 px-4 py-2 rounded-full flex-row items-center gap-2"
                >
                  <Text className="text-white text-xl">🤖</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 🔍 Buscador de Pokémon */}
            <View className="flex-row gap-2 mb-3">
              <TextInput
                value={searchInput}
                onChangeText={setSearchInput}
                onSubmitEditing={handleSearch}
                placeholder="Buscar por nombre o #ID"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl"
              />
              <TouchableOpacity
                onPress={handleSearch}
                className="bg-purple-500 px-6 py-3 rounded-xl items-center justify-center"
              >
                <Text className="text-white font-bold">🔍</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 🧩 Contenido del Pokémon */}
          <View className="bg-white rounded-b-3xl shadow-2xl p-6 mt-4">
            {loading && <LoadingSpinner />}

            {error && (
              <View className="items-center py-12">
                <Text className="text-red-500 font-bold text-xl">{error}</Text>
                <TouchableOpacity
                  onPress={handleRandom}
                  className="mt-4 bg-purple-500 px-6 py-2 rounded-xl"
                >
                  <Text className="text-white font-bold">🎲 Buscar Aleatorio</Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading && !error && pokemon && (
              <View>
                {/* Imagen y nombre */}
                <View className="bg-gray-100 rounded-2xl p-8 mb-6 relative">
                  <TouchableOpacity
                    onPress={toggleFavorite}
                    className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg z-10"
                  >
                    <Text className="text-2xl">{isFavorite ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>

                  <Image
                    source={{
                      uri: pokemon.sprites.other['official-artwork'].front_default,
                    }}
                    style={{ width: 256, height: 256 }}
                    className="mx-auto"
                    resizeMode="contain"
                  />
                </View>

                <View className="items-center mb-6">
                  <Text className="text-gray-500 font-bold text-lg">
                    #{String(pokemon.id).padStart(3, '0')}
                  </Text>
                  <Text className="text-4xl font-bold text-gray-800 capitalize mb-4">
                    {pokemon.name}
                  </Text>
                  <View className="flex-row gap-2 mb-6">
                    {pokemon.types.map((type) => (
                      <TypeBadge key={type.type.name} type={type.type.name} />
                    ))}
                  </View>
                </View>

                {/* Stats */}
                <View className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <Text className="text-xl font-bold text-gray-800 mb-4">
                    ⚡ Estadísticas
                  </Text>
                  {pokemon.stats.map((stat) => (
                    <StatBar
                      key={stat.stat.name}
                      name={stat.stat.name}
                      value={stat.base_stat}
                    />
                  ))}
                </View>

                {/* Datos adicionales */}
                <View className="flex-row gap-4 mb-6">
                  <View className="flex-1 bg-blue-50 rounded-xl p-4 items-center">
                    <Text className="text-2xl mb-2">🛡️</Text>
                    <Text className="text-2xl font-bold text-gray-800">
                      {(pokemon.weight / 10).toFixed(1)}
                    </Text>
                    <Text className="text-xs text-gray-600 font-semibold">KG</Text>
                  </View>

                  <View className="flex-1 bg-green-50 rounded-xl p-4 items-center">
                    <Text className="text-2xl mb-2">📏</Text>
                    <Text className="text-2xl font-bold text-gray-800">
                      {(pokemon.height / 10).toFixed(1)}
                    </Text>
                    <Text className="text-xs text-gray-600 font-semibold">M</Text>
                  </View>

                  <View className="flex-1 bg-purple-50 rounded-xl p-4 items-center">
                    <Text className="text-2xl mb-2">⚡</Text>
                    <Text className="text-2xl font-bold text-gray-800">
                      {pokemon.abilities.length}
                    </Text>
                    <Text className="text-xs text-gray-600 font-semibold">
                      HABILIDADES
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Footer */}
          <View className="items-center mt-6 pb-8">
            <Text className="text-white text-sm font-semibold">
              Pokédex con React Native + IA
            </Text>
            <Text className="text-white text-xs mt-1 opacity-75">
              {favorites.length} Pokémon favoritos
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 🧠 Panel lateral de IA */}
      {iaVisible && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '85%',
            backgroundColor: 'white',
            padding: 20,
            transform: [{ translateX: slideAnim }],
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 8,
          }}
        >
          <TouchableOpacity onPress={toggleIA} className="mb-4">
            <Text className="text-lg font-bold text-purple-600">⬅️ Volver a Pokédex</Text>
          </TouchableOpacity>

          <Text className="text-2xl font-bold mb-4 text-purple-700">
            🤖 Asistente IA
          </Text>

          <TextInput
            value={iaQuestion}
            onChangeText={setIaQuestion}
            onSubmitEditing={consultarGemini}
            placeholder="Hazle una pregunta..."
            className="border-2 border-purple-400 rounded-xl px-4 py-3 mb-3"
          />

          <TouchableOpacity
            onPress={consultarGemini}
            className="bg-purple-600 py-3 rounded-xl items-center mb-4"
          >
            <Text className="text-white font-bold text-lg">Enviar</Text>
          </TouchableOpacity>

          {iaLoading ? (
            <ActivityIndicator color="#a855f7" />
          ) : iaResponse ? (
            <ScrollView className="bg-purple-50 rounded-xl p-4 h-[60%]">
              <Text className="text-gray-800">{iaResponse}</Text>
            </ScrollView>
          ) : (
            <Text className="text-gray-500 text-center">
              Escribe algo para empezar.
            </Text>
          )}
        </Animated.View>
      )}
    </View>
  );
}
