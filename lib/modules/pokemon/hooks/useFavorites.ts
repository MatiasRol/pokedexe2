/**
 * ❤️ useFavorites.ts
 *
 * Hook que persiste los favoritos en AsyncStorage.
 * Los favoritos sobreviven al cerrar la app.
 */

import { storageAdapter } from '@/lib/core/storage/storage.adapter';
import { useEffect, useState } from 'react';

const FAVORITES_KEY = 'pokedex_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loaded, setLoaded]       = useState(false);

  // ─── Cargar al montar ─────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await storageAdapter.getItem(FAVORITES_KEY);
        if (raw) setFavorites(JSON.parse(raw));
      } catch {
        // Si falla la lectura, arrancamos con array vacío
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  // ─── Persistir cada vez que cambian ──────────────────────────────────────
  useEffect(() => {
    if (!loaded) return; // No guardar antes de haber cargado
    storageAdapter.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites, loaded]);

  // ─── Acciones ─────────────────────────────────────────────────────────────

  const addFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const removeFavorite = (id: number) => {
    setFavorites(prev => prev.filter(f => f !== id));
  };

  const toggleFavorite = (id: number): 'added' | 'removed' => {
    if (favorites.includes(id)) {
      removeFavorite(id);
      return 'removed';
    } else {
      addFavorite(id);
      return 'added';
    }
  };

  const isFavorite = (id: number): boolean => favorites.includes(id);

  return {
    favorites,
    loaded,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}