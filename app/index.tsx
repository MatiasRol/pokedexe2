import { useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LoadingSpinner from '../components/LoadingSpinner';
import StatBar from '../components/StatBar';
import TypeBadge from '../components/TypeBadge';
import { usePokemon } from '../hooks/usePokemon';

export default function HomeScreen() {
  const { pokemon, loading, error, setPokemonId } = usePokemon(25);
  const [searchInput, setSearchInput] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);

  const handleSearch = () => {
    const value = searchInput.toLowerCase().trim();
    if (value) {
      setPokemonId(value);
      setSearchInput('');
    }
  };

  const handlePrev = () => pokemon && pokemon.id > 1 && setPokemonId(pokemon.id - 1);
  const handleNext = () => pokemon && pokemon.id < 1000 && setPokemonId(pokemon.id + 1);
  const handleRandom = () => setPokemonId(Math.floor(Math.random() * 898) + 1);

  const toggleFavorite = () => {
    if (!pokemon) return;
    setFavorites(prev =>
      prev.includes(pokemon.id)
        ? prev.filter(id => id !== pokemon.id)
        : [...prev, pokemon.id]
    );
  };

  const isFav = pokemon && favorites.includes(pokemon.id);

  return (
    <ScrollView className="flex-1 bg-gradient-to-b from-red-700 to-red-900">
      <View className="p-4 max-w-2xl mx-auto w-full">

        {/* 🔴 CABEZA POKÉDEX */}
        <View className="bg-gradient-to-br from-red-500 to-red-800 rounded-t-3xl shadow-2xl p-6 mb-1 border-b-4 border-red-950">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-4xl font-pixel font-bold text-white drop-shadow-lg">Pokédex</Text>
            <View className="flex-row gap-3">
              <View className="w-8 h-8 bg-blue-400 rounded-full border-2 border-white shadow-lg" />
              <View className="w-5 h-5 bg-yellow-300 rounded-full border border-white shadow-md" />
              <View className="w-5 h-5 bg-green-400 rounded-full border border-white shadow-md" />
            </View>
          </View>

          {/* 🔎 Buscador */}
          <View className="flex-row gap-2">
            <TextInput
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearch}
              placeholder="Buscar Pokémon..."
              placeholderTextColor="#f1f1f1"
              className="flex-1 bg-red-950/50 text-white px-4 py-3 border-2 border-red-300 rounded-xl"
            />
            <TouchableOpacity
              onPress={handleSearch}
              className="bg-yellow-400 px-6 py-3 rounded-xl items-center justify-center shadow-lg border border-yellow-600"
            >
              <Text className="text-black font-bold text-xl">🔍</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 🖥 PANTALLA PRINCIPAL */}
        <View className="bg-gradient-to-br from-green-200 via-green-100 to-green-300 rounded-b-3xl shadow-2xl p-6 border-t-4 border-red-950">
          {loading && <LoadingSpinner />}
          {error && (
            <View className="items-center py-12">
              <Text className="text-red-600 font-bold text-xl">{error}</Text>
              <TouchableOpacity
                onPress={handleRandom}
                className="mt-4 bg-purple-500 px-6 py-2 rounded-xl"
              >
                <Text className="text-white font-bold">🎲 Aleatorio</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && pokemon && (
            <View>

              {/* Imagen Pokémon */}
              <View className="bg-gradient-to-br from-blue-100 to-blue-300 rounded-3xl p-6 mb-6 border-4 border-blue-400 relative shadow-lg">
                <TouchableOpacity
                  onPress={toggleFavorite}
                  className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md border border-gray-200"
                >
                  <Text className="text-2xl">{isFav ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>

                <Image
                  source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
                  style={{ width: 240, height: 240 }}
                  className="mx-auto"
                  resizeMode="contain"
                />
              </View>

              {/* Nombre e ID */}
              <View className="items-center mb-6">
                <Text className="text-gray-600 font-bold text-lg">
                  #{String(pokemon.id).padStart(3, '0')}
                </Text>
                <Text className="text-4xl font-pixel font-bold text-gray-900 capitalize drop-shadow">
                  {pokemon.name}
                </Text>
                <View className="flex-row gap-2 mt-3">
                  {pokemon.types.map((t) => (
                    <TypeBadge key={t.type.name} type={t.type.name} />
                  ))}
                </View>
              </View>

              {/* 📊 Stats */}
              <View className="bg-gradient-to-br from-slate-200 to-slate-100 rounded-3xl p-6 mb-6 border-2 border-gray-300">
                <Text className="text-lg font-bold text-gray-800 mb-4">📊 Estadísticas</Text>
                {pokemon.stats.map((s) => (
                  <StatBar key={s.stat.name} name={s.stat.name} value={s.base_stat} />
                ))}
              </View>

              {/* ⚖️ Peso / 📏 Altura / ⚡ Habilidades */}
              <View className="flex-row gap-3 mb-6">
                <View className="flex-1 bg-blue-200 rounded-xl p-4 items-center border border-blue-400 shadow">
                  <Text className="text-2xl">⚖️</Text>
                  <Text className="text-xl font-bold text-blue-900">
                    {(pokemon.weight / 10).toFixed(1)} kg
                  </Text>
                </View>
                <View className="flex-1 bg-green-200 rounded-xl p-4 items-center border border-green-400 shadow">
                  <Text className="text-2xl">📏</Text>
                  <Text className="text-xl font-bold text-green-900">
                    {(pokemon.height / 10).toFixed(1)} m
                  </Text>
                </View>
                <View className="flex-1 bg-yellow-200 rounded-xl p-4 items-center border border-yellow-400 shadow">
                  <Text className="text-2xl">⚡</Text>
                  <Text className="text-xl font-bold text-yellow-900">
                    {pokemon.abilities.length}
                  </Text>
                </View>
              </View>

              {/* 🎮 Navegación */}
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handlePrev}
                  disabled={pokemon.id <= 1}
                  className="flex-1 bg-gray-300 py-3 rounded-xl items-center border border-gray-400"
                >
                  <Text className="font-bold text-gray-700">⬅️ Anterior</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRandom}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-400 py-3 rounded-xl items-center border border-yellow-600 shadow-lg"
                >
                  <Text className="font-bold text-black">🎲 Aleatorio</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNext}
                  disabled={pokemon.id >= 1000}
                  className="flex-1 bg-gray-300 py-3 rounded-xl items-center border border-gray-400"
                >
                  <Text className="font-bold text-gray-700">Siguiente ➡️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* 🧾 Footer */}
        <View className="items-center mt-6">
          <Text className="text-white text-sm font-semibold font-pixel">
            Pokédex Interactiva 🌈
          </Text>
          <Text className="text-white text-xs mt-1 opacity-75">
            {favorites.length} Pokémon favoritos
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
