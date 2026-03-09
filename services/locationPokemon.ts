/**
 * 🗺️ locationPokemon.ts — versión OpenStreetMap
 *
 * Usa Overpass API (OpenStreetMap) para obtener las coordenadas
 * reales de parques, ríos, plazas, etc. cerca del usuario,
 * y coloca Pokémon en esas ubicaciones geográficas exactas.
 *
 * Sin API key. Gratis. Legal.
 */

import { Pokemon } from './pokeapi';

// ─── Tipos de lugar OSM → tipos de Pokémon ───────────────────────────────────

export interface OsmFeature {
  lat: number;
  lng: number;
  name: string;
  featureType: OsmFeatureType;
}

export type OsmFeatureType =
  | 'park'
  | 'water'
  | 'forest'
  | 'plaza'
  | 'commercial'
  | 'residential'
  | 'mountain'
  | 'beach';

interface FeatureConfig {
  label: string;
  emoji: string;
  pokemonTypes: string[];
}

export const FEATURE_CONFIG: Record<OsmFeatureType, FeatureConfig> = {
  park:        { label: 'Parque',          emoji: '🌳', pokemonTypes: ['grass', 'bug', 'fairy', 'normal'] },
  water:       { label: 'Zona Acuática',   emoji: '💧', pokemonTypes: ['water', 'ice', 'electric'] },
  forest:      { label: 'Bosque',          emoji: '🌲', pokemonTypes: ['grass', 'bug', 'dark', 'poison'] },
  plaza:       { label: 'Plaza',           emoji: '🏛️', pokemonTypes: ['normal', 'fairy', 'psychic'] },
  commercial:  { label: 'Zona Comercial',  emoji: '🏪', pokemonTypes: ['normal', 'electric', 'steel'] },
  residential: { label: 'Zona Residencial',emoji: '🏘️', pokemonTypes: ['normal', 'poison', 'ghost'] },
  mountain:    { label: 'Montaña',         emoji: '⛰️', pokemonTypes: ['rock', 'ground', 'fighting', 'flying'] },
  beach:       { label: 'Playa',           emoji: '🏖️', pokemonTypes: ['water', 'ground', 'flying', 'poison'] },
};

// ─── Query Overpass ───────────────────────────────────────────────────────────

function buildOverpassQuery(lat: number, lng: number, radiusMeters = 1000): string {
  return `
    [out:json][timeout:15];
    (
      node["leisure"="park"](around:${radiusMeters},${lat},${lng});
      way["leisure"="park"](around:${radiusMeters},${lat},${lng});
      node["natural"="water"](around:${radiusMeters},${lat},${lng});
      way["natural"="water"](around:${radiusMeters},${lat},${lng});
      node["natural"="wood"](around:${radiusMeters},${lat},${lng});
      way["natural"="wood"](around:${radiusMeters},${lat},${lng});
      node["amenity"="park"](around:${radiusMeters},${lat},${lng});
      node["place"="square"](around:${radiusMeters},${lat},${lng});
      node["landuse"="commercial"](around:${radiusMeters},${lat},${lng});
      node["landuse"="residential"](around:${radiusMeters},${lat},${lng});
      node["natural"="beach"](around:${radiusMeters},${lat},${lng});
      node["natural"="peak"](around:${radiusMeters},${lat},${lng});
    );
    out center 20;
  `.trim();
}

function tagsToFeatureType(tags: Record<string, string>): OsmFeatureType {
  if (tags.leisure === 'park' || tags.amenity === 'park') return 'park';
  if (tags.natural === 'water' || tags.waterway)          return 'water';
  if (tags.natural === 'wood' || tags.landuse === 'forest') return 'forest';
  if (tags.place === 'square')                            return 'plaza';
  if (tags.landuse === 'commercial')                      return 'commercial';
  if (tags.landuse === 'residential')                     return 'residential';
  if (tags.natural === 'peak')                            return 'mountain';
  if (tags.natural === 'beach')                           return 'beach';
  return 'residential';
}

export async function fetchNearbyFeatures(lat: number, lng: number): Promise<OsmFeature[]> {
  const query = buildOverpassQuery(lat, lng);
  const url   = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  const res  = await fetch(url);
  const data = await res.json();
  const features: OsmFeature[] = [];

  for (const element of data.elements ?? []) {
    const elLat = element.lat ?? element.center?.lat;
    const elLng = element.lon ?? element.center?.lon;
    if (!elLat || !elLng) continue;

    const tags        = element.tags ?? {};
    const featureType = tagsToFeatureType(tags);
    const name        = tags.name ?? FEATURE_CONFIG[featureType].label;

    features.push({ lat: elLat, lng: elLng, name, featureType });
  }

  return features;
}

// ─── PokeAPI helpers ──────────────────────────────────────────────────────────

async function getPokemonIdsByType(type: string): Promise<number[]> {
  try {
    const res  = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    const data = await res.json();
    return data.pokemon
      .map((p: { pokemon: { url: string } }) => {
        const parts = p.pokemon.url.split('/');
        return parseInt(parts[parts.length - 2]);
      })
      .filter((id: number) => id >= 1 && id <= 898);
  } catch {
    return [];
  }
}

async function fetchPokemonDetail(id: number): Promise<Pokemon | null> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

// ─── Resultado: Pokémon con coordenadas reales ────────────────────────────────

export interface SpawnedPokemon {
  pokemon: Pokemon;
  lat: number;
  lng: number;
  locationName: string;
  featureType: OsmFeatureType;
}

export async function getSpawnedPokemon(
  userLat: number,
  userLng: number
): Promise<SpawnedPokemon[]> {
  let features = await fetchNearbyFeatures(userLat, userLng);

  // Fallback si no hay datos OSM (zona rural)
  if (features.length === 0) {
    const fallbackTypes: OsmFeatureType[] = ['residential', 'commercial', 'park'];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * 2 * Math.PI;
      features.push({
        lat: userLat + Math.cos(angle) * 0.004,
        lng: userLng + Math.sin(angle) * 0.004,
        name: FEATURE_CONFIG[fallbackTypes[i % 3]].label,
        featureType: fallbackTypes[i % 3],
      });
    }
  }

  const selected = features.slice(0, 10);
  const spawns: SpawnedPokemon[] = [];

  await Promise.all(
    selected.map(async (feature) => {
      const config     = FEATURE_CONFIG[feature.featureType];
      const randomType = config.pokemonTypes[Math.floor(Math.random() * config.pokemonTypes.length)];
      const ids        = await getPokemonIdsByType(randomType);
      if (ids.length === 0) return;

      const randomId = ids[Math.floor(Math.random() * ids.length)];
      const poke     = await fetchPokemonDetail(randomId);
      if (!poke) return;

      spawns.push({
        pokemon: poke,
        lat: feature.lat,
        lng: feature.lng,
        locationName: feature.name,
        featureType: feature.featureType,
      });
    })
  );

  return spawns;
}