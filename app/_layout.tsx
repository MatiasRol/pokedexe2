import '@/global.css';
import { Stack } from 'expo-router';
import { useNotifications } from '@/lib/modules/notifications/useNotifications';
 
function AppWithNotifications() {
  // Inicializa permisos, canal Android y Pokémon del día
  // desde el layout raíz — igual que la guía con usePushNotifications()
  useNotifications();
 
  return <Stack screenOptions={{ headerShown: false }} />;
}
 
export default function RootLayout() {
  return <AppWithNotifications />;
}
 