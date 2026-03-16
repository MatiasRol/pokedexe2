import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import StatBar from '@/components/atoms/StatBar';
import TypeBadge from '@/components/atoms/TypeBadge';
import QRModal from '@/components/molecules/QRModal';
import IAPanelLateral from '@/components/organisms/IAPanelLateral';
import { useNotifications } from '@/lib/modules/notifications/useNotifications';
import { useFavorites } from '@/lib/modules/pokemon/hooks/useFavorites';
import { usePokemon } from '@/lib/modules/pokemon/hooks/usePokemon';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PokedexScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { pokemon, loading, error, setPokemonId } = usePokemon(25);
  const [searchInput, setSearchInput] = useState('');

  // Leer pokemonId desde params (viene del mapa, notificaciones o escáner)
  useEffect(() => {
    if (params.pokemonId) setPokemonId(Number(params.pokemonId));
  }, [params.pokemonId]);

  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [qrVisible, setQrVisible]       = useState(false);
  const [iaVisible, setIaVisible]       = useState(false);
  const [iaInitialMsg, setIaInitialMsg] = useState<string | undefined>();
  const { notifyFavoriteAdded }         = useNotifications();

  const handleSearch = () => {
    const v = searchInput.toLowerCase().trim();
    if (v) { setPokemonId(v); setSearchInput(''); }
  };
  const handlePrevious = () => { if (pokemon && pokemon.id > 1)    setPokemonId(pokemon.id - 1); };
  const handleNext     = () => { if (pokemon && pokemon.id < 1000) setPokemonId(pokemon.id + 1); };
  const handleRandom   = () => setPokemonId(Math.floor(Math.random() * 898) + 1);

  const handleToggleFavorite = async () => {
    if (!pokemon) return;
    const action = toggleFavorite(pokemon.id);
    if (action === 'added') {
      await notifyFavoriteAdded(pokemon.name, favorites.length + 1);
    }
  };

  const handleAskIA = (initialMessage?: string) => {
    setIaInitialMsg(initialMessage);
    setIaVisible(true);
  };

  return (
    <View className="flex-1 bg-red-600">
      <ScrollView className="flex-1">
        <View className="p-4 max-w-2xl mx-auto w-full">

          {/* ── HEADER ── */}
          <View className="bg-red-700 rounded-3xl shadow-2xl p-6 mb-2 mt-8 border-4 border-red-800">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-16 h-16 bg-blue-400 rounded-full border-4 border-blue-600 shadow-lg" />
              <View className="w-4 h-4 bg-red-400 rounded-full border-2 border-red-600" />
              <View className="w-4 h-4 bg-yellow-400 rounded-full border-2 border-yellow-600" />
              <View className="w-4 h-4 bg-green-400 rounded-full border-2 border-green-600" />
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-white">POKÉDEX</Text>
              <View className="flex-row gap-2 flex-wrap justify-end">
                <TouchableOpacity onPress={() => router.push('/(app)/scanner')} className="bg-emerald-600 px-3 py-2 rounded-2xl border-2 border-emerald-800">
                  <Text className="text-white font-bold text-sm">📷</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(app)/map')} className="bg-blue-600 px-3 py-2 rounded-2xl border-2 border-blue-800">
                  <Text className="text-white font-bold text-sm">🗺️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(app)/store')} className="bg-amber-500 px-3 py-2 rounded-2xl border-2 border-amber-700">
                  <Text className="text-white font-bold text-sm">🛒</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleAskIA()} className="bg-purple-600 px-3 py-2 rounded-2xl border-2 border-purple-800">
                  <Text className="text-white font-bold text-sm">🤖</Text>
                </TouchableOpacity>
                <View className="flex-row items-center gap-1 bg-pink-500 px-3 py-2 rounded-2xl border-2 border-pink-700">
                  <Text className="text-white text-xs">❤️</Text>
                  <Text className="font-bold text-white text-xs">{favorites.length}</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/(app)/profile')} className="bg-gray-600 px-3 py-2 rounded-2xl border-2 border-gray-700">
                  <Text className="text-white font-bold text-sm">👤</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row gap-2">
              <TextInput
                value={searchInput}
                onChangeText={setSearchInput}
                onSubmitEditing={handleSearch}
                placeholder="Buscar por nombre o #ID"
                placeholderTextColor="#9CA3AF"
                className="flex-1 px-5 py-4 bg-white rounded-2xl font-semibold text-base"
              />
              <TouchableOpacity onPress={handleSearch} className="bg-blue-500 px-5 py-4 rounded-2xl border-2 border-blue-700 items-center justify-center">
                <Text className="text-white font-bold text-xl">🔍</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── PANTALLA ── */}
          <View className="bg-gray-800 rounded-3xl shadow-2xl p-6 border-4 border-gray-900">
            <View className="bg-green-100 rounded-2xl p-4 border-4 border-green-900 shadow-inner">
              {loading && <LoadingSpinner />}

              {error && (
                <View className="items-center py-12">
                  <Text className="text-red-700 font-bold text-xl mb-4">⚠️ {error}</Text>
                  <TouchableOpacity onPress={handleRandom} className="bg-red-600 px-6 py-3 rounded-2xl border-2 border-red-800">
                    <Text className="text-white font-bold">🎲 Pokémon Aleatorio</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!loading && !error && pokemon && (
                <View>
                  {/* Imagen + favorito */}
                  <View className="bg-white rounded-3xl p-6 mb-4 relative shadow-lg border-2 border-gray-300">
                    <TouchableOpacity onPress={handleToggleFavorite} className="absolute top-3 right-3 bg-pink-100 rounded-full p-3 shadow-lg z-10 border-2 border-pink-300">
                      <Text className="text-3xl">{isFavorite(pokemon.id) ? '❤️' : '🤍'}</Text>
                    </TouchableOpacity>
                    <Image
                      source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
                      style={{ width: 240, height: 240 }}
                      className="mx-auto"
                      resizeMode="contain"
                    />
                  </View>

                  {/* Info */}
                  <View className="items-center mb-4 bg-white rounded-2xl p-4 shadow-md border-2 border-gray-300">
                    <Text className="text-gray-500 font-bold text-base">#{String(pokemon.id).padStart(3, '0')}</Text>
                    <Text className="text-4xl font-bold text-gray-900 capitalize mb-3">{pokemon.name}</Text>
                    <View className="flex-row gap-2 mb-4">
                      {pokemon.types.map(t => <TypeBadge key={t.type.name} type={t.type.name} />)}
                    </View>

                    <View className="w-full flex-row gap-2 mb-2">
                      <TouchableOpacity onPress={() => setQrVisible(true)} className="flex-1 bg-emerald-500 py-3 rounded-2xl items-center border-2 border-emerald-700">
                        <Text className="text-white font-bold text-sm">📱 Ver QR</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => router.push('/(app)/map')} className="flex-1 bg-blue-500 py-3 rounded-2xl items-center border-2 border-blue-700">
                        <Text className="text-white font-bold text-sm">🗺️ Mapa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => router.push('/(app)/store')} className="flex-1 bg-amber-500 py-3 rounded-2xl items-center border-2 border-amber-700">
                        <Text className="text-white font-bold text-sm">🛒</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleAskIA(`¡Hola! Puedo responder preguntas sobre ${pokemon.name}. ¿Qué quieres saber?`)}
                      className="bg-purple-600 p-3 rounded-2xl items-center w-full border-2 border-purple-800"
                    >
                      <Text className="text-white font-bold text-sm">🤖 Pregunta a la IA sobre {pokemon.name}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Stats */}
                  <View className="bg-blue-50 rounded-2xl p-5 mb-4 border-2 border-blue-200">
                    <Text className="text-xl font-bold text-blue-900 mb-3">⚡ Estadísticas</Text>
                    {pokemon.stats.map(stat => <StatBar key={stat.stat.name} name={stat.stat.name} value={stat.base_stat} />)}
                  </View>

                  {/* Info adicional */}
                  <View className="flex-row gap-3 mb-4">
                    {[
                      { icon: '⚖️', val: `${(pokemon.weight / 10).toFixed(1)}`, unit: 'KG',  bg: 'bg-yellow-100', border: 'border-yellow-300' },
                      { icon: '📏', val: `${(pokemon.height / 10).toFixed(1)}`, unit: 'M',   bg: 'bg-green-100',  border: 'border-green-300'  },
                      { icon: '✨', val: `${pokemon.abilities.length}`,          unit: 'HAB', bg: 'bg-purple-100', border: 'border-purple-300' },
                    ].map(({ icon, val, unit, bg, border }) => (
                      <View key={unit} className={`flex-1 ${bg} rounded-2xl p-4 items-center border-2 ${border}`}>
                        <Text className="text-3xl mb-1">{icon}</Text>
                        <Text className="text-2xl font-bold text-gray-800">{val}</Text>
                        <Text className="text-xs text-gray-600 font-bold">{unit}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Habilidades */}
                  <View className="bg-orange-50 rounded-2xl p-4 mb-4 border-2 border-orange-200">
                    <Text className="text-sm font-bold text-orange-900 mb-2">🎯 Habilidades:</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {pokemon.abilities.map(ability => (
                        <View key={ability.ability.name} className="bg-orange-200 px-4 py-2 rounded-xl border border-orange-400">
                          <Text className="text-orange-900 text-sm font-bold capitalize">{ability.ability.name.replace('-', ' ')}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Navegación */}
                  <View className="flex-row gap-2 mb-6">
                    <TouchableOpacity onPress={handlePrevious} disabled={pokemon.id <= 1} className={`flex-1 py-4 rounded-2xl items-center border-2 ${pokemon.id <= 1 ? 'bg-gray-300 border-gray-400' : 'bg-blue-500 border-blue-700'}`}>
                      <Text className={`font-bold ${pokemon.id <= 1 ? 'text-gray-500' : 'text-white'}`}>← Anterior</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleRandom} className="flex-1 bg-green-500 py-4 rounded-2xl items-center border-2 border-green-700">
                      <Text className="text-white font-bold">🎲 Aleatorio</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleNext} disabled={pokemon.id >= 1000} className={`flex-1 py-4 rounded-2xl items-center border-2 ${pokemon.id >= 1000 ? 'bg-gray-300 border-gray-400' : 'bg-blue-500 border-blue-700'}`}>
                      <Text className={`font-bold ${pokemon.id >= 1000 ? 'text-gray-500' : 'text-white'}`}>Siguiente →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View className="items-center mt-6 pb-8">
            <Text className="text-white text-xs opacity-90">{favorites.length} Pokémon favoritos guardados</Text>
          </View>
        </View>
      </ScrollView>

      {pokemon && (
        <QRModal visible={qrVisible} pokemonId={pokemon.id} pokemonName={pokemon.name} onClose={() => setQrVisible(false)} />
      )}
      {iaVisible && (
        <IAPanelLateral pokemonName={pokemon?.name} pokemonTypes={pokemon?.types.map(t => t.type.name)} initialMessage={iaInitialMsg} onClose={() => setIaVisible(false)} />
      )}
    </View>
  );
}