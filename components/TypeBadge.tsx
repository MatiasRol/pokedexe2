import { Text, View } from 'react-native';
import { getTypeColor } from '../utils/colors';

interface TypeBadgeProps {
  type: string;
}

export default function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <View className={`${getTypeColor(type)} px-4 py-2 rounded-full`}>
      <Text className="text-white font-bold text-sm uppercase">
        {type}
      </Text>
    </View>
  );
}