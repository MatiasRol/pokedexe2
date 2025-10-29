import { useEffect, useState } from 'react';
import { getPokemon, Pokemon } from '../services/pokeapi';

export const usePokemon = (initialId: number = 25) => {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pokemonId, setPokemonId] = useState<string | number>(initialId);

  const fetchPokemon = async (id: string | number) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getPokemon(id);
      setPokemon(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemon(pokemonId);
  }, [pokemonId]);

  return {
    pokemon,
    loading,
    error,
    setPokemonId,
    refetch: () => fetchPokemon(pokemonId),
  };
};