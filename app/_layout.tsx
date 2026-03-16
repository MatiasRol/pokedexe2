import '@/global.css';
import { getSession, UserSession } from '@/lib/modules/auth/auth.service';
import { useNotifications } from '@/lib/modules/notifications/useNotifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

function AppGuard() {
  const router   = useRouter();
  const segments = useSegments();
  const [session, setSession]   = useState<UserSession | null>(null);
  const [loading, setLoading]   = useState(true);

  useNotifications();

  // Verificar sesión al montar
  useEffect(() => {
    getSession().then(s => {
      setSession(s);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (session && inAuthGroup) {
      router.replace('/pokedex');
    }
  }, [session, loading, segments]);

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