import { getSession, UserSession } from '@/lib/modules/auth/auth.service';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
 
export default function AuthLayout() {
  const router   = useRouter();
  const segments = useSegments();
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
    if (session) {
      router.replace('/(app)/pokedex');
    }
  }, [session, loading]);
 
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }
 
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}