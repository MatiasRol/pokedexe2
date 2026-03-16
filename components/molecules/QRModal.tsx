/**
 * 📱 QRModal.tsx — Molécula
 *
 * Modal del QR de un Pokémon, extraído de pokedex.tsx.
 */

import PokemonQR from '@/components/molecules/PokemonQR';
import { useRouter } from 'expo-router';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface QRModalProps {
  visible: boolean;
  pokemonId: number;
  pokemonName: string;
  onClose: () => void;
}

export default function QRModal({
  visible,
  pokemonId,
  pokemonName,
  onClose,
}: QRModalProps) {
  const router = useRouter();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 items-center justify-center px-6">
        <View className="bg-gray-900 rounded-3xl p-6 w-full items-center border border-white/10">

          {/* Header */}
          <View className="flex-row justify-between items-center w-full mb-5">
            <Text className="text-white text-lg font-bold capitalize">
              QR de {pokemonName}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-white/10 rounded-full w-9 h-9 items-center justify-center"
            >
              <Text className="text-white font-bold">✕</Text>
            </TouchableOpacity>
          </View>

          {/* QR */}
          <PokemonQR
            pokemonId={pokemonId}
            pokemonName={pokemonName}
            size={200}
          />

          <Text className="text-gray-400 text-xs mt-4 text-center leading-relaxed">
            Escanea este código con la app para{'\n'}cargar directamente este Pokémon
          </Text>

          {/* Botón escáner */}
          <TouchableOpacity
            onPress={() => { onClose(); router.push('/qr-scanner'); }}
            className="bg-emerald-600 mt-4 px-8 py-3 rounded-2xl border border-emerald-800 w-full items-center"
          >
            <Text className="text-white font-bold">📷 Abrir Escáner</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}