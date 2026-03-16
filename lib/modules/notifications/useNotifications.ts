/**
 * 🧠 useNotifications.ts — Capa de Lógica de Negocio
 *
 * Patrón de la guía: este hook orquesta las notificaciones de la app.
 * Llama al Adapter (infraestructura) y expone métodos tipados
 * para cada caso de uso del Pokédex.
 *
 * NO importa nada de UI. Solo lógica.
 */

import {
    addNotificationResponseListener,
    cancelAllScheduled,
    requestPermissions,
    scheduledailyNotification,
    sendLocalNotification,
    setupAndroidChannel,
    setupNotifications
} from '@/lib/core/notifications/notification.adapter';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

// ─── Setup global (una sola vez al cargar el módulo) ──────────────────────────
setupNotifications();

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useNotifications() {

  // ─── Inicialización al montar ──────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      await setupAndroidChannel();
      await requestPermissions();
      // Programar el Pokémon del día a las 9:00 AM
      await schedulePokemonOfTheDay();
    };
    init();
  }, []);

  // ─── Listeners para respuesta del usuario ─────────────────────────────────
  const responseListenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Cuando el usuario toca una notificación
    responseListenerRef.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      // Aquí podrías navegar según data.screen, data.pokemonId, etc.
      console.log('[Notificación tocada]', data);
    });

    return () => {
      responseListenerRef.current?.remove();
    };
  }, []);

  // ─── 1. Pokémon encontrados en el mapa ─────────────────────────────────────
  const notifyMapPokemon = async (count: number, zoneName: string) => {
    if (count === 0) return;
    await sendLocalNotification({
      title: `🗺️ ¡${count} Pokémon cerca de ti!`,
      body: `En la zona "${zoneName}" hay Pokémon esperando. ¡Ábrelos en el mapa!`,
      data: { screen: 'pokemon-map', type: 'map_spawn' },
    });
  };

  // ─── 2. Pago confirmado ────────────────────────────────────────────────────
  const notifyPaymentSuccess = async (amount: string, last4: string) => {
    await sendLocalNotification({
      title: '💳 ¡Pago exitoso!',
      body: `Tu compra de $${amount} fue procesada con la tarjeta terminada en ${last4}.`,
      data: { screen: 'payment-success', type: 'payment' },
    });
  };

  // ─── 3. QR escaneado ──────────────────────────────────────────────────────
  const notifyQRScanned = async (content: string) => {
    const isUrl     = content.startsWith('http');
    const isPokemon = content.startsWith('pokemon:');
    const preview   = content.length > 40 ? content.slice(0, 37) + '…' : content;

    const body = isPokemon
      ? `Pokémon #${content.replace('pokemon:', '')} detectado. ¡Cargando en el Pokédex!`
      : isUrl
      ? `URL detectada: ${preview}`
      : `Código detectado: ${preview}`;

    await sendLocalNotification({
      title: '📷 ¡Código escaneado!',
      body,
      data: { screen: 'qr-scanner', type: 'qr_scan', content },
    });
  };

  // ─── 4. Pokémon del día (programada) ──────────────────────────────────────
  const schedulePokemonOfTheDay = async () => {
    const randomId   = Math.floor(Math.random() * 898) + 1;
    const pokemonIds = [
      { id: 25,  name: 'Pikachu'    },
      { id: 1,   name: 'Bulbasaur'  },
      { id: 4,   name: 'Charmander' },
      { id: 7,   name: 'Squirtle'   },
      { id: 39,  name: 'Jigglypuff' },
      { id: 133, name: 'Eevee'      },
      { id: 94,  name: 'Gengar'     },
      { id: 143, name: 'Snorlax'    },
    ];
    const daily = pokemonIds[randomId % pokemonIds.length];

    await scheduledailyNotification(
      {
        title: '🌟 ¡Pokémon del día!',
        body: `Hoy te toca conocer a ${daily.name}. ¡Ábrelo en el Pokédex!`,
        data: { screen: 'pokedex', pokemonId: daily.id, type: 'daily' },
      },
      9,  // 9:00 AM
      0
    );
  };

  // ─── 5. Favorito agregado ─────────────────────────────────────────────────
  const notifyFavoriteAdded = async (pokemonName: string, totalFavorites: number) => {
    await sendLocalNotification({
      title: `❤️ ¡${pokemonName} agregado a favoritos!`,
      body: `Ahora tienes ${totalFavorites} Pokémon favorito${totalFavorites !== 1 ? 's' : ''}. ¡Sigue coleccionando!`,
      data: { screen: 'pokedex', type: 'favorite', pokemonName },
    });
  };

  return {
    notifyMapPokemon,
    notifyPaymentSuccess,
    notifyQRScanned,
    notifyFavoriteAdded,
    schedulePokemonOfTheDay,
    cancelAllScheduled,
  };
}