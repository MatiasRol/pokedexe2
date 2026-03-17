import { Pokemon } from './pokemon.types';

// ─── Pokébolas ────────────────────────────────────────────────────────────────

export type PokeballType = 'normal' | 'super' | 'ultra';

export interface PokeballConfig {
  type:        PokeballType;
  label:       string;
  emoji:       string;
  probability: number;   // 0-1
  price:       number;   // en monedas
  color:       string;   // color del borde
}

export const POKEBALL_CONFIG: Record<PokeballType, PokeballConfig> = {
  normal: {
    type:        'normal',
    label:       'Pokébola',
    emoji:       '⚽',
    probability: 0.30,
    price:       50,
    color:       '#ef4444',
  },
  super: {
    type:        'super',
    label:       'Superball',
    emoji:       '🔵',
    probability: 0.55,
    price:       100,
    color:       '#3b82f6',
  },
  ultra: {
    type:        'ultra',
    label:       'Ultra Ball',
    emoji:       '⚫',
    probability: 0.80,
    price:       200,
    color:       '#f59e0b',
  },
};

// ─── Inventario ───────────────────────────────────────────────────────────────

export interface Inventory {
  coins:     number;
  pokeballs: Record<PokeballType, number>;
}

export const DEFAULT_INVENTORY: Inventory = {
  coins:     500,   // monedas iniciales
  pokeballs: {
    normal: 5,
    super:  2,
    ultra:  1,
  },
};

// ─── Pokémon capturado ────────────────────────────────────────────────────────

export interface CapturedPokemon {
  uid:         string;    // ID único de esta captura
  pokemon:     Pokemon;
  capturedAt:  string;    // ISO date
  pokeball:    PokeballType;
  sellPrice:   number;    // monedas al vender
}

// ─── Tienda ───────────────────────────────────────────────────────────────────

export interface StoreItem {
  id:          string;
  name:        string;
  emoji:       string;
  description: string;
  price:       number;
  type:        'pokeball' | 'pokemon';
  pokeballType?: PokeballType;
  pokemonId?:  number;
}