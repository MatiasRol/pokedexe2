import CaptureModal from '@/components/molecules/CaptureModal';
import { setupAudio } from '@/lib/core/audio/sounds';
import { getTypeHex } from '@/lib/core/constants/colors';
import { POKEBALL_CONFIG, PokeballType } from '@/lib/core/types/game.types';
import { SpawnedPokemon } from '@/lib/core/types/location.types';
import { Pokemon } from '@/lib/core/types/pokemon.types';
import { useInventoryContext } from '@/lib/modules/game/InventoryContext';
import { FEATURE_CONFIG, getSpawnedPokemon } from '@/lib/modules/maps/services/locationPokemon';
import { useNotifications } from '@/lib/modules/notifications/useNotifications';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Callout, Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// ─── Hook de mapa ─────────────────────────────────────────────────────────────

function useMapPokemon() {
  const [coords, setCoords]   = useState<{ lat: number; lng: number } | null>(null);
  const [spawns, setSpawns]   = useState<SpawnedPokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase]     = useState('Obteniendo ubicación…');
  const [error, setError]     = useState<string | null>(null);

  const { notifyMapPokemon } = useNotifications();

  useEffect(() => { setupAudio(); }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setError('Permiso de ubicación denegado'); return; }

      setPhase('Obteniendo ubicación…');
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude: lat, longitude: lng } = loc.coords;
      setCoords({ lat, lng });

      setPhase('Buscando Pokémon cercanos…');
      const result = await getSpawnedPokemon(lat, lng);
      setSpawns(result);

      if (result.length > 0) {
        const zonas  = [...new Set(result.map(s => s.featureType))];
        const config = FEATURE_CONFIG[zonas[0]];
        await notifyMapPokemon(result.length, `${config.emoji} ${config.label}`);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  return { coords, spawns, loading, phase, error, refresh: load };
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────

export default function MapScreen() {
  const router = useRouter();
  const { coords, spawns, loading, phase, error, refresh } = useMapPokemon();

  // ✅ Contexto global — se actualiza en tiempo real en toda la app
  const { inventory, attemptCapture } = useInventoryContext();

  const mapRef = useRef<MapView>(null);

  // Estado del modal de captura
  const [captureTarget, setCaptureTarget] = useState<Pokemon | null>(null);
  const [modalVisible, setModalVisible]   = useState(false);

  // ✅ IDs de Pokémon ya capturados — desaparecen del mapa inmediatamente
  const [capturedIds, setCapturedIds] = useState<Set<string>>(new Set());

  const handleMarkerPress = (pokemon: Pokemon) => {
    setCaptureTarget(pokemon);
    setModalVisible(true);
  };

  const handleCapture = (ballType: PokeballType) => {
    if (!captureTarget) return 'fail' as const;
    const result = attemptCapture(captureTarget, ballType);
    if (result === 'success') {
      setCapturedIds(prev => new Set([...prev, `${captureTarget.id}`]));
    }
    return result;
  };

  // ── Cargando ──
  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center px-8">
        <Text className="text-6xl mb-5">🗺️</Text>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text className="text-white font-semibold text-lg mt-5">{phase}</Text>
        <Text className="text-gray-500 text-sm mt-2 text-center">
          Buscando Pokémon salvajes cerca de ti…
        </Text>
      </View>
    );
  }

  // ── Error ──
  if (error || !coords) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center px-8">
        <Text className="text-5xl mb-4">📍</Text>
        <Text className="text-white text-xl font-bold text-center mb-2">
          {error ?? 'No se pudo obtener la ubicación'}
        </Text>
        <Text className="text-gray-400 text-sm text-center mb-8">
          Activa el GPS para encontrar Pokémon cercanos.
        </Text>
        <TouchableOpacity onPress={refresh} className="bg-red-600 px-8 py-4 rounded-2xl">
          <Text className="text-white font-bold">🔄 Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pokémon visibles = todos menos los ya capturados
  const visibleSpawns = spawns.filter(
    spawn => !capturedIds.has(`${spawn.pokemon.id}`)
  );

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude:       coords.lat,
          longitude:      coords.lng,
          latitudeDelta:  0.018,
          longitudeDelta: 0.018,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Radio de aparición */}
        <Circle
          center={{ latitude: coords.lat, longitude: coords.lng }}
          radius={1000}
          fillColor="rgba(239,68,68,0.07)"
          strokeColor="rgba(239,68,68,0.4)"
          strokeWidth={1.5}
        />

        {/* ✅ Solo Pokémon no capturados */}
        {visibleSpawns.map((spawn, i) => (
          <Marker
            key={`${spawn.pokemon.id}-${i}`}
            coordinate={{ latitude: spawn.lat, longitude: spawn.lng }}
            onPress={() => handleMarkerPress(spawn.pokemon)}
          >
            <View style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: 'white',
              borderWidth: 2.5,
              borderColor: getTypeHex(spawn.pokemon.types[0]?.type.name),
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4,
            }}>
              <Image
                source={{
                  uri: spawn.pokemon.sprites.other['official-artwork'].front_default
                    ?? spawn.pokemon.sprites.front_default,
                }}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </View>

            <Callout tooltip>
              <View style={{ width: 120 }} className="bg-white rounded-2xl p-2 items-center shadow-lg border border-gray-100">
                <Text className="text-gray-800 font-bold text-xs capitalize">{spawn.pokemon.name}</Text>
                <Text className="text-gray-400 text-xs mt-0.5">Toca para capturar</Text>
                <Image
                  source={{ uri: POKEBALL_CONFIG.normal.imageUrl }}
                  style={{ width: 24, height: 24, marginTop: 4 }}
                  resizeMode="contain"
                />
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* ── Header flotante ── */}
      <View
        style={{ position: 'absolute', top: 52, left: 16, right: 16 }}
        className="flex-row justify-between items-center"
      >
        {/* ✅ Pokébolas con imagen real — se actualiza en tiempo real */}
        <View className="bg-gray-900/90 rounded-2xl px-3 py-2 border border-white/10 flex-row gap-3">
          {(Object.keys(POKEBALL_CONFIG) as PokeballType[]).map(type => (
            <View key={type} className="items-center">
              <Image
                source={{ uri: POKEBALL_CONFIG[type].imageUrl }}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
              <Text className="text-white text-xs font-bold mt-0.5">
                {inventory.pokeballs[type]}
              </Text>
            </View>
          ))}
        </View>

        {/* ✅ Monedas en tiempo real */}
        <View className="bg-gray-900/90 rounded-2xl px-3 py-2 border border-white/10">
          <Text className="text-yellow-400 font-bold text-sm">🪙 {inventory.coins}</Text>
        </View>

        <TouchableOpacity
          onPress={refresh}
          className="bg-red-600/90 rounded-full w-11 h-11 items-center justify-center border border-red-800"
        >
          <Text className="text-white text-lg">🔄</Text>
        </TouchableOpacity>
      </View>

      {/* ── Panel inferior ── */}
      <View
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
        className="bg-gray-950/95 rounded-t-3xl px-5 pt-4 pb-6 border-t border-white/10"
      >
        <Text className="text-white font-bold text-sm mb-2">
          {visibleSpawns.length} Pokémon salvajes cerca de ti
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {[...new Set(spawns.map(s => s.featureType))].map(ft => (
            <View
              key={ft}
              className="flex-row items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
            >
              <Text>{FEATURE_CONFIG[ft].emoji}</Text>
              <Text className="text-gray-300 text-xs">{FEATURE_CONFIG[ft].label}</Text>
            </View>
          ))}
        </View>
        <Text className="text-gray-600 text-xs mt-2">
          📍 Toca un Pokémon para intentar capturarlo
        </Text>
      </View>

      {/* ── Modal de captura ── */}
      <CaptureModal
        visible={modalVisible}
        pokemon={captureTarget}
        pokeballs={inventory.pokeballs}
        onCapture={handleCapture}
        onClose={() => {
          setModalVisible(false);
          setCaptureTarget(null);
        }}
      />
    </View>
  );
}