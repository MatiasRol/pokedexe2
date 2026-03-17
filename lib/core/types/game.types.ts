/**
 * 🎮 game.types.ts
 * Tipos para el sistema de captura, Pokébolas e inventario.
 * Imágenes de Pokébolas: sprites oficiales de PokeAPI.
 */

import { Pokemon } from './pokemon.types';

// ─── Pokébolas ────────────────────────────────────────────────────────────────

export type PokeballType = 'normal' | 'super' | 'ultra';

export interface PokeballConfig {
  type:        PokeballType;
  label:       string;
  emoji:       string;           // fallback si la imagen falla
  imageUrl:    string;           // sprite oficial de PokeAPI
  probability: number;
  price:       number;
  color:       string;
  description: string;
}

// Sprites oficiales — mismo repositorio que usa la PokeAPI
const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items';

export const POKEBALL_CONFIG: Record<PokeballType, PokeballConfig> = {
  normal: {
    type:        'normal',
    label:       'Pokébola',
    emoji:       '⚽',
    imageUrl:    `${SPRITE_BASE}/poke-ball.png`,
    probability: 0.30,
    price:       50,
    color:       '#ef4444',
    description: 'La Pokébola clásica. Probabilidad básica de captura.',
  },
  super: {
    type:        'super',
    label:       'Superball',
    emoji:       '🔵',
    imageUrl:    `${SPRITE_BASE}/great-ball.png`,
    probability: 0.55,
    price:       100,
    color:       '#3b82f6',
    description: 'Mayor rendimiento. Duplica las posibilidades.',
  },
  ultra: {
    type:        'ultra',
    label:       'Ultra Ball',
    emoji:       '⚫',
    imageUrl:    `${SPRITE_BASE}/ultra-ball.png`,
    probability: 0.80,
    price:       200,
    color:       '#f59e0b',
    description: 'La mejor Pokébola. Alta tasa de captura garantizada.',
  },
};

// ─── Inventario ───────────────────────────────────────────────────────────────

export interface Inventory {
  coins:     number;
  pokeballs: Record<PokeballType, number>;
}

export const DEFAULT_INVENTORY: Inventory = {
  coins:     500,
  pokeballs: {
    normal: 5,
    super:  2,
    ultra:  1,
  },
};

// ─── Pokémon capturado ────────────────────────────────────────────────────────

export interface CapturedPokemon {
  uid:        string;
  pokemon:    Pokemon;
  capturedAt: string;
  pokeball:   PokeballType;
  sellPrice:  number;
}

// ─── Tienda ───────────────────────────────────────────────────────────────────

export interface StoreItem {
  id:           string;
  name:         string;
  emoji:        string;
  description:  string;
  price:        number;
  type:         'pokeball' | 'pokemon';
  pokeballType?: PokeballType;
  pokemonId?:   number;
}