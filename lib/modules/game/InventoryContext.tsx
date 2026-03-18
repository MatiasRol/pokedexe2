/**
 * 🎒 InventoryContext.tsx
 *
 * Contexto global del inventario.
 * Al envolver la app con este provider, todos los componentes
 * comparten la misma instancia — los cambios se reflejan
 * inmediatamente en toda la app sin recargar.
 */

import { useInventory } from '@/lib/modules/game/useInventory';
import React, { createContext, useContext } from 'react';

// Tipo del contexto = lo que devuelve useInventory
type InventoryContextType = ReturnType<typeof useInventory>;

const InventoryContext = createContext<InventoryContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  // Una sola instancia del hook para toda la app
  const inventory = useInventory();

  return (
    <InventoryContext.Provider value={inventory}>
      {children}
    </InventoryContext.Provider>
  );
}

// ─── Hook de consumo ──────────────────────────────────────────────────────────

export function useInventoryContext(): InventoryContextType {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    throw new Error('useInventoryContext debe usarse dentro de InventoryProvider');
  }
  return ctx;
}