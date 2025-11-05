import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import AIChat from '../components/AIChat';

export default function AIChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const pokemonName = params.pokemonName as string | undefined;
  const pokemonTypes = params.pokemonTypes 
    ? (params.pokemonTypes as string).split(',') 
    : undefined;

  return (
    <View className="flex-1 bg-purple-500 p-4">
      {/* Header con botón de regreso */}
      <View className="flex-row items-center mb-4 mt-12">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white rounded-full p-3 shadow-lg"
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold ml-4">
          Chat con IA
        </Text>
      </View>

      {/* Chat Component */}
      <View className="flex-1 mb-4">
        <AIChat pokemonName={pokemonName} pokemonTypes={pokemonTypes} />
      </View>
    </View>
  );
}