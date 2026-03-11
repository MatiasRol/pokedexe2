import { Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface PokemonQRProps {
  pokemonId: number;
  pokemonName: string;
  size?: number;
}

export default function PokemonQR({
  pokemonId,
  pokemonName,
  size = 160,
}: PokemonQRProps) {
  const qrValue = `pokemon:${pokemonId}`;

  return (
    <View className="items-center">
      <View
        className="bg-white rounded-3xl p-4 items-center shadow-lg border-2 border-gray-100"
        style={{ width: size + 40 }}
      >
        <View className="bg-red-600 px-4 py-1 rounded-full mb-3 -mt-1">
          <Text className="text-white font-bold text-xs uppercase tracking-widest">
            Pokédex QR
          </Text>
        </View>
        <QRCode
          value={qrValue}
          size={size}
          color="#1a1a2e"
          backgroundColor="white"
          quietZone={6}
        />
        <View className="mt-3 items-center">
          <Text className="text-gray-400 text-xs font-mono">
            #{String(pokemonId).padStart(3, '0')}
          </Text>
          <Text className="text-gray-800 text-sm font-bold capitalize mt-0.5">
            {pokemonName}
          </Text>
        </View>
      </View>
      <Text className="text-gray-400 text-xs mt-2 text-center">
        Escanea para ver este Pokémon
      </Text>
    </View>
  );
}
