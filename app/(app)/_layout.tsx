import { getSession, UserSession } from '@/lib/modules/auth/auth.service';
import { InventoryProvider } from '@/lib/modules/game/InventoryContext';
import { Tabs, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
 
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
    if (!session) router.replace('/(auth)/login');
  }, [session, loading]);
 
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }
 
  if (!session) return null;
 
  return (
    // InventoryProvider envuelve TODAS las tabs
    // → una sola instancia compartida en tiempo real
    <InventoryProvider>
      <Tabs
        screenOptions={{
          headerShown:           false,
          tabBarStyle: {
            backgroundColor:     '#111827',
            borderTopColor:      '#1f2937',
            borderTopWidth:      1,
            paddingBottom:       8,
            paddingTop:          8,
            height:              65,
          },
          tabBarActiveTintColor:   '#ef4444',
          tabBarInactiveTintColor: '#6b7280',
          tabBarLabelStyle: {
            fontSize:   11,
            fontWeight: '600',
            marginTop:  2,
          },
        }}
      >
        <Tabs.Screen
          name="map/index"
          options={{
            title: 'Mapa',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 22, color }}>🗺️</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="pokedex/index"
          options={{
            title: 'Pokédex',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 22, color }}>📱</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="store/index"
          options={{
            title: 'Tienda',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 22, color }}>🛒</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="profile/index"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 22, color }}>👤</Text>
            ),
          }}
        />
        <Tabs.Screen name="store/success" options={{ href: null }} />
        <Tabs.Screen name="scanner/index" options={{ href: null }} />
      </Tabs>
    </InventoryProvider>
  );
}