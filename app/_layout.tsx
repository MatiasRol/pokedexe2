import '@/global.css';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import {
  addNotificationResponseListener,
  setupNotifications,
} from '@/lib/core/notifications/notification.adapter';
import { useNotifications } from '@/lib/modules/notifications/useNotifications';
 
// Setup global fuera del componente — una sola vez
setupNotifications();
 
function RootLayoutInner() {
  const router      = useRouter();
  const listenerRef = useRef<Notifications.EventSubscription | null>(null);
 
  // Inicializa permisos + canal Android + Pokémon del día
  useNotifications();
 
  // Listener global: tap en notificación → navegar
  useEffect(() => {
    listenerRef.current = addNotificationResponseListener((response) => {
      const data      = response.notification.request.content.data as Record<string, unknown>;
      const screen    = data?.screen    as string | undefined;
      const pokemonId = data?.pokemonId as number | undefined;
 
      switch (screen) {
        case 'pokedex':
          router.push(
            pokemonId
              ? { pathname: '/(app)/pokedex', params: { pokemonId } }
              : '/(app)/pokedex'
          );
          break;
        case 'pokemon-map':
          router.push('/(app)/map');
          break;
        case 'qr-scanner':
          router.push('/(app)/scanner');
          break;
        case 'payment-success':
          router.push('/(app)/pokedex');
          break;
        default:
          break;
      }
    });
 
    return () => { listenerRef.current?.remove(); };
  }, []);
 
  return <Stack screenOptions={{ headerShown: false }} />;
}
 
export default function RootLayout() {
  return <RootLayoutInner />;
}