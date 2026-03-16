/**
 * 📋 useScanHistory.ts
 *
 * Guarda los últimos 5 escaneos en AsyncStorage.
 * Cada entrada tiene el dato, el tipo de código y la fecha.
 */

import { storageAdapter } from '@/lib/core/storage/storage.adapter';
import { useEffect, useState } from 'react';

const HISTORY_KEY  = 'pokedex_scan_history';
const MAX_ITEMS    = 5;

export interface ScanEntry {
  id:        string;   // timestamp como ID único
  data:      string;   // contenido del código
  type:      string;   // qr, ean13, code128, etc.
  scannedAt: string;   // ISO date string
}

export function useScanHistory() {
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [loaded, setLoaded]   = useState(false);

  // ─── Cargar al montar ──────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await storageAdapter.getItem(HISTORY_KEY);
        if (raw) setHistory(JSON.parse(raw));
      } catch {
        // Si falla, arrancamos vacío
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  // ─── Persistir al cambiar ──────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    storageAdapter.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history, loaded]);

  // ─── Agregar escaneo ───────────────────────────────────────────────────────
  const addScan = (data: string, type: string) => {
    const entry: ScanEntry = {
      id:        Date.now().toString(),
      data,
      type:      type.replace('org.iso.', '').replace('com.google.', ''),
      scannedAt: new Date().toISOString(),
    };

    setHistory(prev => {
      // Eliminar duplicados del mismo dato y mantener solo MAX_ITEMS
      const filtered = prev.filter(e => e.data !== data);
      return [entry, ...filtered].slice(0, MAX_ITEMS);
    });
  };

  // ─── Limpiar historial ─────────────────────────────────────────────────────
  const clearHistory = () => setHistory([]);

  // ─── Helper: etiqueta legible del tipo ────────────────────────────────────
  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      qr:         'QR',
      ean13:      'EAN-13',
      ean8:       'EAN-8',
      upc_a:      'UPC-A',
      upc_e:      'UPC-E',
      code128:    'Code128',
      code39:     'Code39',
      code93:     'Code93',
      itf14:      'ITF-14',
      pdf417:     'PDF417',
      aztec:      'Aztec',
      datamatrix: 'DataMatrix',
    };
    return labels[type.toLowerCase()] ?? type.toUpperCase();
  };

  // ─── Helper: fecha legible ────────────────────────────────────────────────
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const now  = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1)  return 'Ahora mismo';
    if (diffMin < 60) return `Hace ${diffMin} min`;

    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `Hace ${diffHrs}h`;

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return {
    history,
    loaded,
    addScan,
    clearHistory,
    getTypeLabel,
    formatDate,
  };
}