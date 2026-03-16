/**
 * app/_layout.tsx
 *
 * - Protección de rutas basada en sesión persistida
 * - Listener: al tocar una notificación navega a la pantalla correcta
 */

import '@/global.css';
import {
  addNotificationResponseListener,
  setupNotifications,
} from '@/lib/core/notifications/notification.adapter';
import { getSession, UserSession } from '@/lib/modules/auth/auth.service';
import { useNotifications } from '@/lib/modules/notifications/useNotifications';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Setup global fuera del componente — igual que la guía
setupNotifications();

function AppGuard() {
  const router   = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Inicializa permisos + canal Android + Pokémon del día
  useNotifications();

  // ─── Sesión ───────────────────────────────────────────────────────────────
  useEffect(() => {
    getSession().then(s => {
      setSession(s);
      setLoading(false);
    });
  }, []);

  // ─── Protección de rutas ──────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === 'auth';
    if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (session && inAuthGroup) {
      router.replace('/pokedex');
    }
  }, [session, loading, segments]);

  // ─── Listener: tap en notificación ───────────────────────────────────────
  const listenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    listenerRef.current = addNotificationResponseListener((response) => {
      const data      = response.notification.request.content.data as Record<string, unknown>;
      const screen    = data?.screen    as string | undefined;
      const pokemonId = data?.pokemonId as number | undefined;

      switch (screen) {
        // 🌟 Pokémon del día — navega al Pokédex con ese Pokémon cargado
        case 'pokedex':
          router.push(
            pokemonId
              ? { pathname: '/pokedex', params: { pokemonId } }
              : '/pokedex'
          );
          break;

        // 🗺️ Pokémon cercanos — abre el mapa directamente
        case 'pokemon-map':
          router.push('/pokemon-map');
          break;

        // 📷 QR escaneado — vuelve al escáner
        case 'qr-scanner':
          router.push('/qr-scanner');
          break;

        // 💳 Pago confirmado — va al Pokédex (el pago ya terminó)
        case 'payment-success':
          router.push('/pokedex');
          break;

        default:
          break;
      }
    });

    return () => { listenerRef.current?.remove(); };
  }, []);

  // ─── Carga inicial ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return <AppGuard />;
}