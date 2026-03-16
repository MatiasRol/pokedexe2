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
import { FEATURE_CONFIG, getSpawnedPokemon } from '@/lib/modules/maps/services/locationPokemon';
import { SpawnedPokemon }                    from '@/lib/core/types/location.types';
import { getTypeHex }                        from '@/lib/core/constants/colors';
import { useNotifications }                  from '@/lib/modules/notifications/useNotifications';

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useMapPokemon() {
  const [coords, setCoords]   = useState<{ lat: number; lng: number } | null>(null);
  const [spawns, setSpawns]   = useState<SpawnedPokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase]     = useState('Obteniendo ubicación…');
  const [error, setError]     = useState<string | null>(null);

  const { notifyMapPokemon } = useNotifications();

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

      setPhase('Buscando lugares cercanos…');
      const result = await getSpawnedPokemon(lat, lng);
      setPhase('Cargando Pokémon…');
      setSpawns(result);

      if (result.length > 0) {
        const zonas    = [...new Set(result.map(s => s.featureType))];
        const config   = FEATURE_CONFIG[zonas[0]];
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

// ─── Callout ──────────────────────────────────────────────────────────────────

function PokemonCallout({ spawn }: { spawn: SpawnedPokemon }) {
  const config = FEATURE_CONFIG[spawn.featureType];
  return (
    <View style={{ width: 140 }} className="bg-white rounded-2xl p-3 items-center shadow-lg border border-gray-100">
      <Image
        source={{ uri: spawn.pokemon.sprites.other['official-artwork'].front_default ?? spawn.pokemon.sprites.front_default }}
        style={{ width: 64, height: 64 }}
        resizeMode="contain"
      />
      <Text className="text-gray-800 font-bold text-sm capitalize mt-1">{spawn.pokemon.name}</Text>
      <Text className="text-gray-400 text-xs mt-0.5">{config.emoji} {spawn.locationName}</Text>
      <View className="bg-gray-100 rounded-full px-3 py-0.5 mt-1">
        <Text className="text-gray-500 text-xs capitalize">{spawn.pokemon.types[0]?.type.name}</Text>
      </View>
    </View>
  );
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────

export default function MapScreen() {
  const router = useRouter();
  const { coords, spawns, loading, phase, error, refresh } = useMapPokemon();
  const mapRef = useRef<MapView>(null);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center px-8">
        <Text className="text-6xl mb-5">🗺️</Text>
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-white font-semibold text-lg mt-5">{phase}</Text>
        <Text className="text-gray-500 text-sm mt-2 text-center">Usando datos reales de OpenStreetMap</Text>
      </View>
    );
  }

  if (error || !coords) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center px-8">
        <Text className="text-5xl mb-4">📍</Text>
        <Text className="text-white text-xl font-bold text-center mb-2">{error ?? 'No se pudo obtener la ubicación'}</Text>
        <Text className="text-gray-400 text-sm text-center mb-8">Asegúrate de tener el GPS activado.</Text>
        <TouchableOpacity onPress={refresh} className="bg-emerald-600 px-8 py-4 rounded-2xl">
          <Text className="text-white font-bold">🔄 Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-gray-400">← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-950">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={{ latitude: coords.lat, longitude: coords.lng, latitudeDelta: 0.018, longitudeDelta: 0.018 }}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={darkMapStyle}
      >
        <Circle center={{ latitude: coords.lat, longitude: coords.lng }} radius={1000} fillColor="rgba(16,185,129,0.07)" strokeColor="rgba(16,185,129,0.5)" strokeWidth={1.5} />

        {spawns.map((spawn, i) => (
          <Marker
            key={`${spawn.pokemon.id}-${i}`}
            coordinate={{ latitude: spawn.lat, longitude: spawn.lng }}
            onPress={() => router.push({ pathname: '/(app)/pokedex', params: { pokemonId: spawn.pokemon.id } })}
          >
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'white', borderWidth: 2, borderColor: getTypeHex(spawn.pokemon.types[0]?.type.name), alignItems: 'center', justifyContent: 'center' }}>
              <Image source={{ uri: spawn.pokemon.sprites.other['official-artwork'].front_default ?? spawn.pokemon.sprites.front_default }} style={{ width: 36, height: 36 }} resizeMode="contain" />
            </View>
            <Callout tooltip><PokemonCallout spawn={spawn} /></Callout>
          </Marker>
        ))}
      </MapView>

      {/* Botones flotantes */}
      <View style={{ position: 'absolute', top: 52, left: 16, right: 16 }} className="flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="bg-gray-900/90 rounded-full w-11 h-11 items-center justify-center border border-white/10">
          <Text className="text-white text-lg">←</Text>
        </TouchableOpacity>
        <View className="bg-gray-900/90 rounded-2xl px-4 py-2 border border-white/10">
          <Text className="text-white font-bold text-sm">{spawns.length} Pokémon cercanos</Text>
        </View>
        <TouchableOpacity onPress={refresh} className="bg-emerald-600/90 rounded-full w-11 h-11 items-center justify-center border border-emerald-800">
          <Text className="text-white text-lg">🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Panel inferior */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} className="bg-gray-950/95 rounded-t-3xl px-5 pt-4 pb-8 border-t border-white/10">
        <Text className="text-white font-bold text-base mb-3">Zonas detectadas cerca de ti</Text>
        <View className="flex-row flex-wrap gap-2">
          {[...new Set(spawns.map(s => s.featureType))].map(ft => (
            <View key={ft} className="flex-row items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <Text>{FEATURE_CONFIG[ft].emoji}</Text>
              <Text className="text-gray-300 text-xs">{FEATURE_CONFIG[ft].label}</Text>
            </View>
          ))}
        </View>
        <Text className="text-gray-600 text-xs mt-3">📍 Datos de OpenStreetMap · Toca un Pokémon para verlo</Text>
      </View>
    </View>
  );
}

const darkMapStyle = [
  { elementType: 'geometry',           stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'road',     elementType: 'geometry',         stylers: [{ color: '#304a7d' }] },
  { featureType: 'road',     elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'water',    elementType: 'geometry',         stylers: [{ color: '#0e1626' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill',    stylers: [{ color: '#023e58' }] },
];