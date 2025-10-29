import { ActivityIndicator, Text, View } from 'react-native';

export default function LoadingSpinner() {
  return (
    <View className="items-center justify-center py-12">
      <ActivityIndicator size="large" color="#a855f7" />
      <Text className="mt-4 text-gray-600 font-semibold">
        Cargando Pokémon...
      </Text>
    </View>
  );
}