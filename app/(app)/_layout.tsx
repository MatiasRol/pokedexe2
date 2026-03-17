/**
 * app/(app)/_layout.tsx
 *
 * Tab bar inferior con las 4 secciones principales:
 * 🗺️ Mapa (principal) | 📱 Pokédex | 🛒 Tienda | 👤 Perfil
 */

import { getSession, UserSession } from '@/lib/modules/auth/auth.service';
import { Tabs, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function AppLayout() {
  const router    = useRouter();
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
      <View style={{ flex: 1, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  if (!session) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown:          false,
        tabBarStyle: {
          backgroundColor:    '#111827',
          borderTopColor:     '#1f2937',
          borderTopWidth:     1,
          paddingBottom:      8,
          paddingTop:         8,
          height:             65,
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
      {/* 🗺️ MAPA — pantalla principal */}
      <Tabs.Screen
        name="map/index"
        options={{
          title:    'Mapa',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>🗺️</Text>
          ),
        }}
      />

      {/* 📱 POKÉDEX */}
      <Tabs.Screen
        name="pokedex/index"
        options={{
          title:    'Pokédex',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>📱</Text>
          ),
        }}
      />

      {/* 🛒 TIENDA */}
      <Tabs.Screen
        name="store/index"
        options={{
          title:    'Tienda',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>🛒</Text>
          ),
        }}
      />

      {/* 👤 PERFIL */}
      <Tabs.Screen
        name="profile/index"
        options={{
          title:    'Perfil',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>👤</Text>
          ),
        }}
      />

      {/* Pantallas ocultas del tab bar */}
      <Tabs.Screen name="store/success"  options={{ href: null }} />
      <Tabs.Screen name="scanner/index"  options={{ href: null }} />
    </Tabs>
  );
}