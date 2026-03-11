import { Pokemon } from '@/lib/core/types/pokemon.types';
import {
  FeatureConfig,
  OsmFeature,
  OsmFeatureType,
  SpawnedPokemon,
} from '@/lib/core/types/location.types';

export const FEATURE_CONFIG: Record<OsmFeatureType, FeatureConfig> = {
  park:        { label: 'Parque',           emoji: '🌳', pokemonTypes: ['grass', 'bug', 'fairy', 'normal'] },
  water:       { label: 'Zona Acuática',    emoji: '💧', pokemonTypes: ['water', 'ice', 'electric'] },
  forest:      { label: 'Bosque',           emoji: '🌲', pokemonTypes: ['grass', 'bug', 'dark', 'poison'] },
  plaza:       { label: 'Plaza',            emoji: '🏛️', pokemonTypes: ['normal', 'fairy', 'psychic'] },
  commercial:  { label: 'Zona Comercial',   emoji: '🏪', pokemonTypes: ['normal', 'electric', 'steel'] },
  residential: { label: 'Zona Residencial', emoji: '🏘️', pokemonTypes: ['normal', 'poison', 'ghost'] },
  mountain:    { label: 'Montaña',          emoji: '⛰️', pokemonTypes: ['rock', 'ground', 'fighting', 'flying'] },
  beach:       { label: 'Playa',            emoji: '🏖️', pokemonTypes: ['water', 'ground', 'flying', 'poison'] },
};

// ─── Overpass query ───────────────────────────────────────────────────────────

function buildOverpassQuery(lat: number, lng: number, radius = 1000): string {
  return `
    [out:json][timeout:15];
    (
      node["leisure"="park"](around:${radius},${lat},${lng});
      way["leisure"="park"](around:${radius},${lat},${lng});
      node["natural"="water"](around:${radius},${lat},${lng});
      way["natural"="water"](around:${radius},${lat},${lng});
      node["natural"="wood"](around:${radius},${lat},${lng});
      way["natural"="wood"](around:${radius},${lat},${lng});
      node["amenity"="park"](around:${radius},${lat},${lng});
      node["place"="square"](around:${radius},${lat},${lng});
      node["landuse"="commercial"](around:${radius},${lat},${lng});
      node["landuse"="residential"](around:${radius},${lat},${lng});
      node["natural"="beach"](around:${radius},${lat},${lng});
      node["natural"="peak"](around:${radius},${lat},${lng});
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

export async function fetchNearbyFeatures(
  lat: number,
  lng: number
): Promise<OsmFeature[]> {
  const query = buildOverpassQuery(lat, lng);
  const url   = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const res   = await fetch(url);
  const data  = await res.json();
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function getSpawnedPokemon(
  userLat: number,
  userLng: number
): Promise<SpawnedPokemon[]> {
  let features = await fetchNearbyFeatures(userLat, userLng);

  if (features.length === 0) {
    const fallback: OsmFeatureType[] = ['residential', 'commercial', 'park'];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * 2 * Math.PI;
      features.push({
        lat: userLat + Math.cos(angle) * 0.004,
        lng: userLng + Math.sin(angle) * 0.004,
        name: FEATURE_CONFIG[fallback[i % 3]].label,
        featureType: fallback[i % 3],
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
      if (!ids.length) return;

      const poke = await fetchPokemonDetail(ids[Math.floor(Math.random() * ids.length)]);
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
