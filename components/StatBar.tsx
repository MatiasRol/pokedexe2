import { View, Text } from 'react-native';

interface StatBarProps {
  name: string;
  value: number;
}

export default function StatBar({ name, value }: StatBarProps) {
  const percentage = Math.min((value / 255) * 100, 100);

  return (
    <View className="mb-3">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-sm font-semibold text-gray-600 capitalize">
          {name.replace('-', ' ')}
        </Text>
        <Text className="text-sm font-bold text-gray-800">{value}</Text>
      </View>
      <View className="w-full bg-gray-200 rounded-full h-2">
        <View
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}