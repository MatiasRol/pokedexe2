import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#CC0000' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 }}>

        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <View style={{
            backgroundColor: 'white', borderRadius: 80, width: 140, height: 140,
            alignItems: 'center', justifyContent: 'center', marginBottom: 24,
            shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3, shadowRadius: 16, elevation: 12,
            borderWidth: 6, borderColor: '#FFD700',
          }}>
            <Text style={{ fontSize: 72 }}>⚡</Text>
          </View>

          <Text style={{
            fontSize: 52, fontWeight: '900', color: 'white',
            letterSpacing: 3, textAlign: 'center',
            textShadowColor: 'rgba(0,0,0,0.3)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 8,
          }}>
            POKÉDEX
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 6, fontWeight: '500' }}>
            Tu enciclopedia Pokémon definitiva
          </Text>
        </View>

        {/* Botones */}
        <View style={{ width: '100%', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            style={{
              backgroundColor: '#1D4ED8', paddingVertical: 18, borderRadius: 20,
              alignItems: 'center',
              shadowColor: '#1D4ED8', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 17 }}>🔐 Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/registro')}
            style={{
              backgroundColor: '#15803D', paddingVertical: 18, borderRadius: 20,
              alignItems: 'center',
              shadowColor: '#15803D', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 17 }}>✨ Crear Cuenta</Text>
          </TouchableOpacity>
        </View>

        {/* Feature chips */}
        <View style={{ marginTop: 40, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {[
            { icon: '🔍', label: 'Búsqueda' },
            { icon: '❤️', label: 'Favoritos' },
            { icon: '🤖', label: 'Chat IA' },
            { icon: '🗺️', label: 'Mapa' },
            { icon: '📷', label: 'QR' },
          ].map(({ icon, label }) => (
            <View key={label} style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
              flexDirection: 'row', alignItems: 'center', gap: 5,
            }}>
              <Text style={{ fontSize: 14 }}>{icon}</Text>
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>{label}</Text>
            </View>
          ))}
        </View>

      </View>
    </View>
  );
}