import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-red-600">
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo/Icono Principal */}
        <View className="items-center mb-12">
          <View className="bg-white rounded-full w-40 h-40 items-center justify-center mb-6 shadow-2xl border-8 border-yellow-400">
            <Text className="text-8xl">⚡</Text>
          </View>
          
          <Text className="text-6xl font-bold text-white text-center mb-3 drop-shadow-2xl">
            POKÉDEX
          </Text>
          
          <Text className="text-xl text-white text-center opacity-90 font-semibold">
            Tu enciclopedia Pokémon definitiva
          </Text>
        </View>

        {/* Botones de Acción */}
        <View className="w-full max-w-md">
          {/* Botón Iniciar Sesión */}
          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            className="bg-blue-600 py-5 rounded-3xl items-center mb-4 border-4 border-blue-800 shadow-2xl"
          >
            <Text className="text-white font-bold text-xl">
              🔐 Iniciar Sesión
            </Text>
          </TouchableOpacity>

          {/* Botón Registrarse */}
          <TouchableOpacity
            onPress={() => router.push('/auth/registro')}
            className="bg-green-600 py-5 rounded-3xl items-center border-4 border-green-800 shadow-2xl"
          >
            <Text className="text-white font-bold text-xl">
              ✨ Crear Cuenta
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View className="mt-12 items-center">
          <View className="flex-row flex-wrap justify-center gap-4">
            <View className="bg-white/20 px-4 py-2 rounded-2xl border-2 border-white/30">
              <Text className="text-white font-bold">🔍 Búsqueda</Text>
            </View>
            <View className="bg-white/20 px-4 py-2 rounded-2xl border-2 border-white/30">
              <Text className="text-white font-bold">❤️ Favoritos</Text>
            </View>
            <View className="bg-white/20 px-4 py-2 rounded-2xl border-2 border-white/30">
              <Text className="text-white font-bold">🤖 Chat IA</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="absolute bottom-8">
                </View>
      </View>
    </View>
  );
}
