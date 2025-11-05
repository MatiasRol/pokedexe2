import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LoadingSpinner from '../components/LoadingSpinner';
import StatBar from '../components/StatBar';
import TypeBadge from '../components/TypeBadge';
import { usePokemon } from '../hooks/usePokemon';

export default function HomeScreen() {
  const router = useRouter();
  const { pokemon, loading, error, setPokemonId } = usePokemon(25);
  const [searchInput, setSearchInput] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);

  const handleSearch = () => {
    const searchValue = searchInput.toLowerCase().trim();
    if (searchValue) {
      setPokemonId(searchValue);
      setSearchInput('');
    }
  };

  const handlePrevious = () => {
    if (pokemon && pokemon.id > 1) {
      setPokemonId(pokemon.id - 1);
    }
  };

  const handleNext = () => {
    if (pokemon && pokemon.id < 1000) {
      setPokemonId(pokemon.id + 1);
    }
  };

  const handleRandom = () => {
    const randomId = Math.floor(Math.random() * 898) + 1;
    setPokemonId(randomId);
  };

  const toggleFavorite = () => {
    if (!pokemon) return;
    if (favorites.includes(pokemon.id)) {
      setFavorites(favorites.filter(id => id !== pokemon.id));
    } else {
      setFavorites([...favorites, pokemon.id]);
    }
  };

  const isFavorite = pokemon && favorites.includes(pokemon.id);

  return (
    <ScrollView className="flex-1 bg-red-500">
      <View className="p-4 max-w-2xl mx-auto w-full">
        {/* Header */}
        <View className="bg-white rounded-t-3xl shadow-2xl p-6 mb-1 mt-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-3xl font-bold text-gray-800">Pokédex</Text>
            
            <View className="flex-row gap-2">
              {/* Contador de favoritos */}
              <View className="flex-row items-center gap-2 bg-red-500 px-4 py-2 rounded-full">
                <Text className="text-white">❤️</Text>
                <Text className="font-bold text-white">{favorites.length}</Text>
              </View>
              
              {/* Botón de IA */}
              <TouchableOpacity
                onPress={() => router.push('/ai-chat')}
                className="bg-purple-500 px-4 py-2 rounded-full flex-row items-center gap-2"
              >
                <Text className="text-white text-xl">🤖</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Buscador */}
          <View className="flex-row gap-2">
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

        {/* Contenido */}
        <View className="bg-white rounded-b-3xl shadow-2xl p-6">
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
              {/* Imagen */}
              <View className="bg-gray-100 rounded-2xl p-8 mb-6 relative">
                <TouchableOpacity
                  onPress={toggleFavorite}
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg z-10"
                >
                  <Text className="text-2xl">{isFavorite ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>
                
                <Image
                  source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
                  style={{ width: 256, height: 256 }}
                  className="mx-auto"
                  resizeMode="contain"
                />
              </View>

              {/* Info Básica */}
              <View className="items-center mb-6">
                <Text className="text-gray-500 font-bold text-lg">
                  #{String(pokemon.id).padStart(3, '0')}
                </Text>
                <Text className="text-4xl font-bold text-gray-800 capitalize mb-4">
                  {pokemon.name}
                </Text>
                
                {/* Tipos */}
                <View className="flex-row gap-2 mb-6">
                  {pokemon.types.map((type) => (
                    <TypeBadge key={type.type.name} type={type.type.name} />
                  ))}
                </View>
              </View>

              {/* Botón para preguntar a la IA sobre este Pokémon */}
              <TouchableOpacity
                onPress={() => router.push({
                  pathname: '/ai-chat',
                  params: { 
                    pokemonName: pokemon.name,
                    pokemonTypes: pokemon.types.map(t => t.type.name).join(',')
                  }
                })}
                className="bg-purple-500 p-4 rounded-2xl items-center mb-6"
              >
                <Text className="text-white font-bold text-lg">
                  🤖 Pregunta a la IA sobre {pokemon.name}
                </Text>
              </TouchableOpacity>

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

              {/* Info Adicional */}
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
                  <Text className="text-xs text-gray-600 font-semibold">HABILIDADES</Text>
                </View>
              </View>

              {/* Habilidades */}
              <View className="bg-yellow-50 rounded-2xl p-4 mb-6">
                <Text className="text-sm font-bold text-gray-700 mb-2">Habilidades:</Text>
                <View className="flex-row flex-wrap gap-2">
                  {pokemon.abilities.map((ability) => (
                    <View key={ability.ability.name} className="bg-yellow-200 px-4 py-2 rounded-lg">
                      <Text className="text-yellow-800 text-sm font-semibold capitalize">
                        {ability.ability.name.replace('-', ' ')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Navegación */}
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handlePrevious}
                  disabled={pokemon.id <= 1}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    pokemon.id <= 1 ? 'bg-gray-300' : 'bg-gray-200'
                  }`}
                >
                  <Text className="text-gray-700 font-bold">← Anterior</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleRandom}
                  className="flex-1 bg-purple-500 py-3 rounded-xl items-center"
                >
                  <Text className="text-white font-bold">🎲 Aleatorio</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleNext}
                  disabled={pokemon.id >= 1000}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    pokemon.id >= 1000 ? 'bg-gray-300' : 'bg-gray-200'
                  }`}
                >
                  <Text className="text-gray-700 font-bold">Siguiente →</Text>
                </TouchableOpacity>
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
  );
}