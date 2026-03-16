import { getSession, UserSession } from '@/lib/modules/auth/auth.service';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
 
export default function AppLayout() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    getSession().then(s => {
      setSession(s);
      setLoading(false);
    });
  }, []);
 
  useEffect(() => {
    if (loading) return;
    // Sin sesión → ir al login
    if (!session) {
      router.replace('/(auth)/login');
    }
  }, [session, loading]);
 
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }
 
  if (!session) return null;
 
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
