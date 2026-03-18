import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import StatBar from '@/components/atoms/StatBar';
import TypeBadge from '@/components/atoms/TypeBadge';
import QRModal from '@/components/molecules/QRModal';
import IAPanelLateral from '@/components/organisms/IAPanelLateral';
import { POKEBALL_CONFIG } from '@/lib/core/types/game.types';
import { useInventoryContext } from '@/lib/modules/game/InventoryContext';
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
  const [searchInput, setSearchInput]             = useState('');
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { captured }                              = useInventoryContext();
  const [qrVisible, setQrVisible]                 = useState(false);
  const [iaVisible, setIaVisible]                 = useState(false);
  const [iaInitialMsg, setIaInitialMsg]           = useState<string | undefined>();
  const [showCaptured, setShowCaptured]           = useState(false);
  const { notifyFavoriteAdded }                   = useNotifications();

  useEffect(() => {
    if (params.pokemonId) setPokemonId(Number(params.pokemonId));
  }, [params.pokemonId]);

  const handleSearch = () => {
    const v = searchInput.toLowerCase().trim();
    if (v) { setPokemonId(v); setSearchInput(''); }
  };

  const handleToggleFavorite = async () => {
    if (!pokemon) return;
    const action = toggleFavorite(pokemon.id);
    if (action === 'added') await notifyFavoriteAdded(pokemon.name, favorites.length + 1);
  };

  return (
    <View className="flex-1 bg-gray-950">

      {/* ── Header ── */}
      <View className="bg-gray-900 pt-14 pb-4 px-4 border-b border-white/10">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-white text-2xl font-bold">📱 Pokédex</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push('/(app)/scanner')}
              className="bg-emerald-600/20 border border-emerald-600 px-3 py-2 rounded-xl"
            >
              <Text className="text-emerald-400 text-sm font-bold">📷 QR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowCaptured(!showCaptured)}
              className={`px-3 py-2 rounded-xl border ${
                showCaptured
                  ? 'bg-red-600 border-red-800'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <Text className="text-white text-sm font-bold">
                🎒 {captured.length}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Búsqueda */}
        <View className="flex-row gap-2">
          <TextInput
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
            placeholder="Buscar Pokémon por nombre o #ID"
            placeholderTextColor="#6b7280"
            className="flex-1 px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white font-medium"
          />
          <TouchableOpacity
            onPress={handleSearch}
            className="bg-red-600 px-4 py-3 rounded-xl border border-red-800 items-center justify-center"
          >
            <Text className="text-white font-bold">🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">

        {/* ── Panel: Pokémon capturados ── */}
        {showCaptured && (
          <View className="px-4 pt-4">
            <Text className="text-white font-bold text-base mb-3">
              🎒 Pokémon capturados ({captured.length})
            </Text>
            {captured.length === 0 ? (
              <View className="bg-gray-900 rounded-2xl p-6 items-center border border-white/10 mb-4">
                <Text className="text-4xl mb-2">🗺️</Text>
                <Text className="text-gray-400 text-sm text-center">
                  Aún no has capturado ninguno. ¡Ve al mapa!
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                {captured.map(entry => (
                  <TouchableOpacity
                    key={entry.uid}
                    onPress={() => { setPokemonId(entry.pokemon.id); setShowCaptured(false); }}
                    className="bg-gray-900 rounded-2xl p-3 mr-3 items-center border border-white/10"
                    style={{ width: 90 }}
                  >
                    <Image
                      source={{ uri: entry.pokemon.sprites.other['official-artwork'].front_default }}
                      style={{ width: 60, height: 60 }}
                      resizeMode="contain"
                    />
                    <Text className="text-white text-xs capitalize mt-1 text-center" numberOfLines={1}>
                      {entry.pokemon.name}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {POKEBALL_CONFIG[entry.pokeball].emoji}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* ── Info del Pokémon ── */}
        <View className="px-4 pt-4">
          {loading && <LoadingSpinner />}

          {error && (
            <View className="bg-gray-900 rounded-2xl p-6 items-center border border-white/10">
              <Text className="text-red-400 font-bold mb-3">⚠️ {error}</Text>
              <TouchableOpacity
                onPress={() => setPokemonId(Math.floor(Math.random() * 898) + 1)}
                className="bg-red-600 px-5 py-2 rounded-xl border border-red-800"
              >
                <Text className="text-white font-bold">🎲 Aleatorio</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && pokemon && (
            <View>
              {/* Imagen */}
              <View className="bg-gray-900 rounded-3xl p-6 mb-4 relative border border-white/10">
                <TouchableOpacity
                  onPress={handleToggleFavorite}
                  className="absolute top-4 right-4 z-10"
                >
                  <Text className="text-3xl">{isFavorite(pokemon.id) ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>
                <Image
                  source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
                  style={{ width: 220, height: 220 }}
                  className="mx-auto"
                  resizeMode="contain"
                />
              </View>

              {/* Info */}
              <View className="bg-gray-900 rounded-3xl p-5 mb-4 border border-white/10">
                <Text className="text-gray-500 font-bold text-sm">
                  #{String(pokemon.id).padStart(3, '0')}
                </Text>
                <Text className="text-white text-4xl font-bold capitalize mb-3">
                  {pokemon.name}
                </Text>
                <View className="flex-row gap-2 mb-4">
                  {pokemon.types.map(t => <TypeBadge key={t.type.name} type={t.type.name} />)}
                </View>

                {/* Acciones */}
                <View className="flex-row gap-2 mb-2">
                  <TouchableOpacity
                    onPress={() => setQrVisible(true)}
                    className="flex-1 bg-emerald-600/20 border border-emerald-600 py-3 rounded-2xl items-center"
                  >
                    <Text className="text-emerald-400 font-bold text-sm">📱 QR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setIaInitialMsg(`¡Hola! Puedo contarte sobre ${pokemon.name}. ¿Qué quieres saber?`); setIaVisible(true); }}
                    className="flex-1 bg-purple-600/20 border border-purple-600 py-3 rounded-2xl items-center"
                  >
                    <Text className="text-purple-400 font-bold text-sm">🤖 IA</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stats */}
              <View className="bg-gray-900 rounded-3xl p-5 mb-4 border border-white/10">
                <Text className="text-white font-bold text-base mb-3">⚡ Estadísticas</Text>
                {pokemon.stats.map(stat => (
                  <StatBar key={stat.stat.name} name={stat.stat.name} value={stat.base_stat} />
                ))}
              </View>

              {/* Info adicional */}
              <View className="flex-row gap-3 mb-4">
                {[
                  { icon: '⚖️', val: `${(pokemon.weight / 10).toFixed(1)}`, unit: 'KG' },
                  { icon: '📏', val: `${(pokemon.height / 10).toFixed(1)}`, unit: 'M' },
                  { icon: '✨', val: `${pokemon.abilities.length}`, unit: 'HAB' },
                ].map(({ icon, val, unit }) => (
                  <View key={unit} className="flex-1 bg-gray-900 rounded-2xl p-4 items-center border border-white/10">
                    <Text className="text-2xl mb-1">{icon}</Text>
                    <Text className="text-white text-xl font-bold">{val}</Text>
                    <Text className="text-gray-500 text-xs">{unit}</Text>
                  </View>
                ))}
              </View>

              {/* Navegación */}
              <View className="flex-row gap-2 mb-6">
                <TouchableOpacity
                  onPress={() => { if (pokemon.id > 1) setPokemonId(pokemon.id - 1); }}
                  disabled={pokemon.id <= 1}
                  className={`flex-1 py-4 rounded-2xl items-center border ${pokemon.id <= 1 ? 'bg-gray-800 border-gray-700' : 'bg-white/5 border-white/10'}`}
                >
                  <Text className={`font-bold ${pokemon.id <= 1 ? 'text-gray-600' : 'text-white'}`}>← Anterior</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPokemonId(Math.floor(Math.random() * 898) + 1)}
                  className="flex-1 bg-red-600 py-4 rounded-2xl items-center border border-red-800"
                >
                  <Text className="text-white font-bold">🎲 Aleatorio</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { if (pokemon.id < 1000) setPokemonId(pokemon.id + 1); }}
                  disabled={pokemon.id >= 1000}
                  className={`flex-1 py-4 rounded-2xl items-center border ${pokemon.id >= 1000 ? 'bg-gray-800 border-gray-700' : 'bg-white/5 border-white/10'}`}
                >
                  <Text className={`font-bold ${pokemon.id >= 1000 ? 'text-gray-600' : 'text-white'}`}>Siguiente →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View className="h-6" />
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