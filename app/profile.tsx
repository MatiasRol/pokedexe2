import { clearSession, getSession, UserSession } from '@/lib/modules/auth/auth.service';
import { useFavorites } from '@/lib/modules/pokemon/hooks/useFavorites';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [session, setSession]         = useState<UserSession | null>(null);
  const [loggingOut, setLoggingOut]   = useState(false);
  const { favorites }                 = useFavorites();

  useEffect(() => {
    getSession().then(setSession);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await clearSession();
    router.replace('/auth/login');
  };

  // Fecha de registro legible
  const memberSince = session?.loggedInAt
    ? new Date(session.loggedInAt).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  return (
    <View className="flex-1 bg-red-600">
      <ScrollView className="flex-1">
        <View className="px-5 pt-14 pb-10 max-w-md mx-auto w-full">

          {/* ── Header ── */}
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white/20 rounded-full w-10 h-10 items-center justify-center"
            >
              <Text className="text-white font-bold text-lg">←</Text>
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Mi Perfil</Text>
            <View className="w-10" />
          </View>

          {/* ── Avatar ── */}
          <View className="items-center mb-8">
            <View className="bg-white rounded-full w-28 h-28 items-center justify-center shadow-2xl border-4 border-yellow-400 mb-4">
              <Text className="text-6xl">🎮</Text>
            </View>
            <Text className="text-white text-2xl font-bold capitalize">
              {session?.name ?? '—'}
            </Text>
            <Text className="text-white/70 text-sm mt-1">
              {session?.email ?? '—'}
            </Text>
          </View>

          {/* ── Stats ── */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-white/10 rounded-2xl p-4 items-center border border-white/20">
              <Text className="text-4xl font-bold text-white">{favorites.length}</Text>
              <Text className="text-white/70 text-xs mt-1">Favoritos</Text>
            </View>
            <View className="flex-1 bg-white/10 rounded-2xl p-4 items-center border border-white/20">
              <Text className="text-2xl font-bold text-white">🏆</Text>
              <Text className="text-white/70 text-xs mt-1">Entrenador</Text>
            </View>
            <View className="flex-1 bg-white/10 rounded-2xl p-4 items-center border border-white/20">
              <Text className="text-white font-bold text-xs text-center">{memberSince}</Text>
              <Text className="text-white/70 text-xs mt-1">Desde</Text>
            </View>
          </View>

          {/* ── Opciones ── */}
          <View className="bg-white/10 rounded-3xl border border-white/20 overflow-hidden mb-6">

            {[
              { icon: '🎮', label: 'Pokédex',      onPress: () => router.push('/pokedex')       },
              { icon: '🗺️', label: 'Mapa',          onPress: () => router.push('/pokemon-map')   },
              { icon: '📷', label: 'Escáner QR',   onPress: () => router.push('/qr-scanner')    },
              { icon: '🛒', label: 'Tienda',        onPress: () => router.push('/checkout')      },
            ].map(({ icon, label, onPress }, i, arr) => (
              <TouchableOpacity
                key={label}
                onPress={onPress}
                className={`flex-row items-center px-5 py-4 ${
                  i < arr.length - 1 ? 'border-b border-white/10' : ''
                }`}
              >
                <Text className="text-2xl mr-4">{icon}</Text>
                <Text className="text-white font-semibold flex-1">{label}</Text>
                <Text className="text-white/40">→</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Cerrar sesión ── */}
          <TouchableOpacity
            onPress={handleLogout}
            disabled={loggingOut}
            className={`py-5 rounded-2xl items-center border-2 ${
              loggingOut
                ? 'bg-gray-400 border-gray-500'
                : 'bg-white border-white'
            }`}
          >
            <Text className={`font-bold text-lg ${loggingOut ? 'text-white' : 'text-red-600'}`}>
              {loggingOut ? '⏳ Cerrando sesión...' : '🚪 Cerrar Sesión'}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}