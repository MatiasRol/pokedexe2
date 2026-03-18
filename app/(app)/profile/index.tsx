import { POKEBALL_CONFIG, PokeballType } from '@/lib/core/types/game.types';
import { clearSession, getSession, UserSession } from '@/lib/modules/auth/auth.service';
import { useInventory } from '@/lib/modules/game/useInventory';
import { useFavorites } from '@/lib/modules/pokemon/hooks/useFavorites';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
 
export default function ProfileScreen() {
  const router = useRouter();
  const [session, setSession]       = useState<UserSession | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const { favorites }               = useFavorites();
  const { inventory, captured }     = useInventory();
 
  useEffect(() => { getSession().then(setSession); }, []);
 
  const handleLogout = async () => {
    setLoggingOut(true);
    await clearSession();
    router.replace('/(auth)/login');
  };
 
  const memberSince = session?.loggedInAt
    ? new Date(session.loggedInAt).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';
 
  return (
    <View className="flex-1 bg-gray-950">
      <ScrollView className="flex-1">
        <View className="px-5 pt-14 pb-10">
 
          {/* Header */}
          <Text className="text-white text-2xl font-bold mb-6">👤 Perfil</Text>
 
          {/* Avatar */}
          <View className="bg-gray-900 rounded-3xl p-6 items-center border border-white/20 mb-4">
            <View className="bg-red-600 rounded-full w-24 h-24 items-center justify-center mb-4 border-4 border-red-800">
              <Text className="text-5xl">🎮</Text>
            </View>
            <Text className="text-white text-xl font-bold capitalize">{session?.name ?? '—'}</Text>
            <Text className="text-gray-400 text-sm mt-1">{session?.email ?? '—'}</Text>
            <Text className="text-gray-600 text-xs mt-1">Miembro desde {memberSince}</Text>
          </View>
 
          {/* Stats del juego */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-gray-900 rounded-2xl p-4 items-center border border-white/20">
              <Text className="text-3xl font-bold text-red-400">{captured.length}</Text>
              <Text className="text-gray-400 text-xs mt-1">Capturados</Text>
            </View>
            <View className="flex-1 bg-gray-900 rounded-2xl p-4 items-center border border-white/20">
              <Text className="text-3xl font-bold text-yellow-400">{inventory.coins}</Text>
              <Text className="text-gray-400 text-xs mt-1">🪙 Monedas</Text>
            </View>
            <View className="flex-1 bg-gray-900 rounded-2xl p-4 items-center border border-white/20">
              <Text className="text-3xl font-bold text-pink-400">{favorites.length}</Text>
              <Text className="text-gray-400 text-xs mt-1">❤️ Favoritos</Text>
            </View>
          </View>
 
          {/* Inventario de Pokébolas */}
          <View className="bg-gray-900 rounded-3xl p-5 mb-4 border border-white/20">
            <Text className="text-white font-bold text-base mb-3">🎒 Pokébolas</Text>
            <View className="flex-row gap-3">
              {(Object.keys(POKEBALL_CONFIG) as PokeballType[]).map(type => {
                const cfg   = POKEBALL_CONFIG[type];
                const count = inventory.pokeballs[type];
                return (
                  <View key={type} className="flex-1 bg-white/5 rounded-2xl p-3 items-center border border-white/20">
                    <Text className="text-3xl">{cfg.emoji}</Text>
                    <Text className="text-white font-bold text-lg mt-1">{count}</Text>
                    <Text className="text-gray-500 text-xs">{cfg.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
 
          {/* Accesos rápidos */}
          <View className="bg-gray-900 rounded-3xl border border-white/20 overflow-hidden mb-6">
            {[
              { icon: '🗺️', label: 'Mapa',        route: '/(app)/map'     },
              { icon: '📱', label: 'Pokédex',      route: '/(app)/pokedex' },
              { icon: '🛒', label: 'Tienda',        route: '/(app)/store'  },
              { icon: '📷', label: 'Escáner QR',   route: '/(app)/scanner' },
            ].map(({ icon, label, route }, i, arr) => (
              <TouchableOpacity
                key={label}
                onPress={() => router.push(route as any)}
                className={`flex-row items-center px-5 py-4 gap-3 ${
                  i < arr.length - 1 ? 'border-b border-white/10' : ''
                }`}
              >
                <Text className="text-2xl">{icon}</Text>
                <Text className="text-white font-semibold flex-1">{label}</Text>
                <Text className="text-gray-600">→</Text>
              </TouchableOpacity>
            ))}
          </View>
 
          {/* Cerrar sesión */}
          <TouchableOpacity
            onPress={handleLogout}
            disabled={loggingOut}
            className={`py-5 rounded-2xl items-center border-2 ${
              loggingOut ? 'bg-gray-700 border-gray-600' : 'bg-red-600 border-red-800'
            }`}
          >
            <Text className="text-white font-bold text-lg">
              {loggingOut ? '⏳ Cerrando sesión...' : '🚪 Cerrar Sesión'}
            </Text>
          </TouchableOpacity>
 
        </View>
      </ScrollView>
    </View>
  );
}