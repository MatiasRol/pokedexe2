import { Pokemon } from './pokemon.types';

export type OsmFeatureType =
  | 'park'
  | 'water'
  | 'forest'
  | 'plaza'
  | 'commercial'
  | 'residential'
  | 'mountain'
  | 'beach';

export interface OsmFeature {
  lat: number;
  lng: number;
  name: string;
  featureType: OsmFeatureType;
}

export interface SpawnedPokemon {
  pokemon: Pokemon;
  lat: number;
  lng: number;
  locationName: string;
  featureType: OsmFeatureType;
}

export interface FeatureConfig {
  label: string;
  emoji: string;
  pokemonTypes: string[];
}
