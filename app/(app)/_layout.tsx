import { getSession, UserSession } from '@/lib/modules/auth/auth.service';
import { InventoryProvider, useInventoryContext } from '@/lib/modules/game/InventoryContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

// ─── Badge de advertencia en Pokébolas ───────────────────────────────────────

function PokeballTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const { inventory } = useInventoryContext();
  const totalBalls    = Object.values(inventory.pokeballs).reduce((a, b) => a + b, 0);
  const lowStock      = totalBalls < 3;

  return (
    <View>
      <Ionicons
        name={focused ? 'location' : 'location-outline'}
        size={24}
        color={color}
      />
      {lowStock && (
        <View
          style={{
            position:        'absolute',
            top:             -3,
            right:           -6,
            backgroundColor: '#ef4444',
            borderRadius:    6,
            width:           12,
            height:          12,
            alignItems:      'center',
            justifyContent:  'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 7, fontWeight: '900' }}>!</Text>
        </View>
      )}
    </View>
  );
}

// ─── Layout interno (usa el contexto) ────────────────────────────────────────

function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor:  '#1e293b',
          borderTopWidth:  1,
          paddingBottom:   10,
          paddingTop:      8,
          height:          68,
        },
        tabBarActiveTintColor:   '#ef4444',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: {
          fontSize:   10,
          fontWeight: '600',
          marginTop:  2,
        },
      }}
    >
      {/* 🗺️ MAPA */}
      <Tabs.Screen
        name="map/index"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, focused }) => (
            <PokeballTabIcon color={color} focused={focused} />
          ),
        }}
      />

      {/* 📱 POKÉDEX */}
      <Tabs.Screen
        name="pokedex/index"
        options={{
          title: 'Pokédex',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'book' : 'book-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 🛒 TIENDA */}
      <Tabs.Screen
        name="store/index"
        options={{
          title: 'Tienda',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'cart' : 'cart-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 👤 PERFIL */}
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Ocultos */}
      <Tabs.Screen name="store/success" options={{ href: null }} />
      <Tabs.Screen name="scanner/index" options={{ href: null }} />
    </Tabs>
  );
}

// ─── Layout raíz con protección de rutas ─────────────────────────────────────

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
      <View style={{ flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  if (!session) return null;

  return (
    <InventoryProvider>
      <AppTabs />
    </InventoryProvider>
  );
}