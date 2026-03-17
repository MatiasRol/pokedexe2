import { storageAdapter } from '@/lib/core/storage/storage.adapter';
import {
    CapturedPokemon,
    DEFAULT_INVENTORY,
    Inventory,
    POKEBALL_CONFIG,
    PokeballType,
} from '@/lib/core/types/game.types';
import { Pokemon } from '@/lib/core/types/pokemon.types';
import { useEffect, useState } from 'react';

const INVENTORY_KEY = 'pokedex_inventory';
const CAPTURED_KEY  = 'pokedex_captured';

export function useInventory() {
  const [inventory, setInventory]   = useState<Inventory>(DEFAULT_INVENTORY);
  const [captured, setCaptured]     = useState<CapturedPokemon[]>([]);
  const [loaded, setLoaded]         = useState(false);

  // ─── Cargar ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const rawInv = await storageAdapter.getItem(INVENTORY_KEY);
        const rawCap = await storageAdapter.getItem(CAPTURED_KEY);
        if (rawInv) setInventory(JSON.parse(rawInv));
        if (rawCap) setCaptured(JSON.parse(rawCap));
      } catch {
        // fallback al default
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  // ─── Persistir ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    storageAdapter.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  }, [inventory, loaded]);

  useEffect(() => {
    if (!loaded) return;
    storageAdapter.setItem(CAPTURED_KEY, JSON.stringify(captured));
  }, [captured, loaded]);

  // ─── Comprar Pokébola ─────────────────────────────────────────────────────
  const buyPokeball = (type: PokeballType, qty = 1): boolean => {
    const cost = POKEBALL_CONFIG[type].price * qty;
    if (inventory.coins < cost) return false;
    setInventory(prev => ({
      ...prev,
      coins: prev.coins - cost,
      pokeballs: {
        ...prev.pokeballs,
        [type]: prev.pokeballs[type] + qty,
      },
    }));
    return true;
  };

  // ─── Intentar captura ─────────────────────────────────────────────────────
  const attemptCapture = (
    pokemon: Pokemon,
    ballType: PokeballType
  ): 'success' | 'fail' | 'no_balls' => {
    if (inventory.pokeballs[ballType] <= 0) return 'no_balls';

    // Consumir la Pokébola siempre (igual que en el juego real)
    setInventory(prev => ({
      ...prev,
      pokeballs: {
        ...prev.pokeballs,
        [ballType]: prev.pokeballs[ballType] - 1,
      },
    }));

    // Calcular probabilidad
    const prob    = POKEBALL_CONFIG[ballType].probability;
    const success = Math.random() < prob;

    if (success) {
      const entry: CapturedPokemon = {
        uid:        `${pokemon.id}-${Date.now()}`,
        pokemon,
        capturedAt: new Date().toISOString(),
        pokeball:   ballType,
        sellPrice:  Math.floor(50 + Math.random() * 150),
      };
      setCaptured(prev => [entry, ...prev]);
      return 'success';
    }

    return 'fail';
  };

  // ─── Vender Pokémon ───────────────────────────────────────────────────────
  const sellPokemon = (uid: string): boolean => {
    const entry = captured.find(c => c.uid === uid);
    if (!entry) return false;

    setCaptured(prev => prev.filter(c => c.uid !== uid));
    setInventory(prev => ({ ...prev, coins: prev.coins + entry.sellPrice }));
    return true;
  };

  // ─── Comprar Pokémon en tienda ────────────────────────────────────────────
  const buyPokemon = (pokemon: Pokemon, price: number): boolean => {
    if (inventory.coins < price) return false;

    const entry: CapturedPokemon = {
      uid:        `buy-${pokemon.id}-${Date.now()}`,
      pokemon,
      capturedAt: new Date().toISOString(),
      pokeball:   'normal',
      sellPrice:  Math.floor(price * 0.6),
    };

    setInventory(prev => ({ ...prev, coins: prev.coins - price }));
    setCaptured(prev => [entry, ...prev]);
    return true;
  };

  // ─── Agregar monedas (para futuras recompensas) ───────────────────────────
  const addCoins = (amount: number) => {
    setInventory(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  return {
    inventory,
    captured,
    loaded,
    buyPokeball,
    attemptCapture,
    sellPokemon,
    buyPokemon,
    addCoins,
  };
}