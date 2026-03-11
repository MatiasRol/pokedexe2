import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { FEATURE_CONFIG, getSpawnedPokemon } from '@/lib/modules/maps/services/locationPokemon';
import { SpawnedPokemon } from '@/lib/core/types/location.types';
import { getTypeHex } from '@/lib/core/constants/colors';

function useMapPokemon() {
  const [coords, setCoords]   = useState<{ lat: number; lng: number } | null>(null);
  const [spawns, setSpawns]   = useState<SpawnedPokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase]     = useState('Obteniendo ubicación…');
  const [error, setError]     = useState<string | null>(null);

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
    } catch (err: any) {
      setError(err?.message ?? 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  return { coords, spawns, loading, phase, error, refresh: load };
}

function PokemonCallout({ spawn }: { spawn: SpawnedPokemon }) {
  const config = FEATURE_CONFIG[spawn.featureType];
  const typeColor = getTypeHex(spawn.pokemon.types[0]?.type.name);
  return (
    <View style={{
      width: 150, backgroundColor: 'white', borderRadius: 16,
      padding: 12, alignItems: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
      borderWidth: 2, borderColor: typeColor,
    }}>
      <Image
        source={{ uri: spawn.pokemon.sprites.other['official-artwork'].front_default ?? spawn.pokemon.sprites.front_default }}
        style={{ width: 70, height: 70 }}
        resizeMode="contain"
      />
      <Text style={{ color: '#111827', fontWeight: '800', fontSize: 13, textTransform: 'capitalize', marginTop: 4 }}>
        {spawn.pokemon.name}
      </Text>
      <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>
        {config.emoji} {spawn.locationName}
      </Text>
      <View style={{ backgroundColor: typeColor, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 }}>
        <Text style={{ color: 'white', fontSize: 10, fontWeight: '700', textTransform: 'capitalize' }}>
          {spawn.pokemon.types[0]?.type.name}
        </Text>
      </View>
    </View>
  );
}

export default function PokemonMapScreen() {
  const router = useRouter();
  const { coords, spawns, loading, phase, error, refresh } = useMapPokemon();
  const mapRef = useRef<MapView>(null);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#030712', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <Text style={{ fontSize: 56, marginBottom: 24 }}>🗺️</Text>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 17, marginTop: 20 }}>{phase}</Text>
        <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
          Usando coordenadas reales{'\n'}de OpenStreetMap
        </Text>

        {/* Progress steps */}
        <View style={{ marginTop: 32, gap: 10 }}>
          {['Obteniendo ubicación…', 'Buscando lugares cercanos…', 'Cargando Pokémon…'].map((step, i) => {
            const steps = ['Obteniendo ubicación…', 'Buscando lugares cercanos…', 'Cargando Pokémon…'];
            const currentIdx = steps.indexOf(phase);
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{
                  width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: done ? '#10B981' : active ? '#065F46' : '#1F2937',
                  borderWidth: 1.5, borderColor: done ? '#10B981' : active ? '#10B981' : '#374151',
                }}>
                  <Text style={{ fontSize: 10, color: done || active ? 'white' : '#6B7280', fontWeight: '700' }}>
                    {done ? '✓' : String(i + 1)}
                  </Text>
                </View>
                <Text style={{ color: active ? '#10B981' : done ? '#6EE7B7' : '#374151', fontSize: 13, fontWeight: active ? '700' : '400' }}>
                  {step}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  if (error || !coords) {
    return (
      <View style={{ flex: 1, backgroundColor: '#030712', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📍</Text>
        <Text style={{ color: 'white', fontSize: 19, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
          {error ?? 'No se pudo obtener la ubicación'}
        </Text>
        <Text style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 20 }}>
          Asegúrate de tener el GPS activado y los permisos otorgados.
        </Text>
        <TouchableOpacity
          onPress={refresh}
          style={{ backgroundColor: '#10B981', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 18, marginBottom: 12 }}
        >
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>🔄 Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={{ paddingVertical: 12 }}>
          <Text style={{ color: '#6B7280', fontSize: 14 }}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#030712' }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: coords.lat, longitude: coords.lng,
          latitudeDelta: 0.018, longitudeDelta: 0.018,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={darkMapStyle}
      >
        <Circle
          center={{ latitude: coords.lat, longitude: coords.lng }}
          radius={1000}
          fillColor="rgba(16,185,129,0.06)"
          strokeColor="rgba(16,185,129,0.45)"
          strokeWidth={1.5}
        />
        {spawns.map((spawn, i) => (
          <Marker
            key={`${spawn.pokemon.id}-${i}`}
            coordinate={{ latitude: spawn.lat, longitude: spawn.lng }}
            onPress={() => router.push(`/pokedex?pokemonId=${spawn.pokemon.id}`)}
          >
            <View style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: 'white',
              borderWidth: 2.5,
              borderColor: getTypeHex(spawn.pokemon.types[0]?.type.name),
              alignItems: 'center', justifyContent: 'center',
              shadowColor: getTypeHex(spawn.pokemon.types[0]?.type.name),
              shadowOpacity: 0.5, shadowRadius: 6, elevation: 4,
            }}>
              <Image
                source={{ uri: spawn.pokemon.sprites.other['official-artwork'].front_default ?? spawn.pokemon.sprites.front_default }}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </View>
            <Callout tooltip><PokemonCallout spawn={spawn} /></Callout>
          </Marker>
        ))}
      </MapView>

      {/* Header flotante */}
      <View style={{
        position: 'absolute', top: 52, left: 16, right: 16,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: 'rgba(3,7,18,0.85)', borderRadius: 20, width: 44, height: 44,
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <Text style={{ color: 'white', fontSize: 18 }}>←</Text>
        </TouchableOpacity>

        <View style={{
          backgroundColor: 'rgba(3,7,18,0.85)', borderRadius: 20,
          paddingHorizontal: 16, paddingVertical: 10,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        }}>
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>
            🎮 {spawns.length} Pokémon cercanos
          </Text>
        </View>

        <TouchableOpacity
          onPress={refresh}
          style={{
            backgroundColor: 'rgba(16,185,129,0.85)', borderRadius: 20, width: 44, height: 44,
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)',
          }}
        >
          <Text style={{ fontSize: 18 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Panel inferior */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(3,7,18,0.96)', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36,
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
      }}>
        {/* Handle */}
        <View style={{ width: 36, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, alignSelf: 'center', marginBottom: 14 }} />

        <Text style={{ color: 'white', fontWeight: '800', fontSize: 15, marginBottom: 12 }}>
          Zonas detectadas cerca de ti
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {[...new Set(spawns.map(s => s.featureType))].map(ft => (
            <View key={ft} style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
            }}>
              <Text style={{ fontSize: 15 }}>{FEATURE_CONFIG[ft].emoji}</Text>
              <Text style={{ color: '#D1D5DB', fontSize: 12, fontWeight: '600' }}>{FEATURE_CONFIG[ft].label}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={{ color: '#374151', fontSize: 11, marginTop: 14 }}>
          📡 Datos de OpenStreetMap · Toca un Pokémon para verlo
        </Text>
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