import {
    POKEBALL_CONFIG,
    PokeballType,
} from '@/lib/core/types/game.types';
import { Pokemon } from '@/lib/core/types/pokemon.types';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Image,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type CaptureResult = 'idle' | 'throwing' | 'success' | 'fail' | 'no_balls';

interface CaptureModalProps {
  visible:     boolean;
  pokemon:     Pokemon | null;
  pokeballs:   Record<PokeballType, number>;
  onCapture:   (ballType: PokeballType) => CaptureResult;
  onClose:     () => void;
}

export default function CaptureModal({
  visible,
  pokemon,
  pokeballs,
  onCapture,
  onClose,
}: CaptureModalProps) {
  const [result, setResult]       = useState<CaptureResult>('idle');
  const [selected, setSelected]   = useState<PokeballType>('normal');

  // Animación de la Pokébola
  const throwAnim  = useRef(new Animated.Value(0)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(1)).current;

  // Reset al abrir
  useEffect(() => {
    if (visible) {
      setResult('idle');
      throwAnim.setValue(0);
      shakeAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  }, [visible]);

  const handleThrow = () => {
    if (result === 'throwing') return;
    setResult('throwing');

    // Animación de lanzamiento
    Animated.sequence([
      Animated.timing(throwAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(shakeAnim, { toValue: 1, friction: 2, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      const outcome = onCapture(selected);
      setResult(outcome);

      if (outcome === 'success') {
        Animated.spring(scaleAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 4,
        }).start();
      }
    });
  };

  if (!pokemon) return null;

  const ballShake = shakeAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '-15deg', '15deg', '-10deg', '0deg'],
  });

  const config = POKEBALL_CONFIG[selected];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-gray-900 rounded-t-3xl p-6 border-t border-white/10">

          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white font-bold text-lg capitalize">
              ¡{pokemon.name} aparece!
            </Text>
            <TouchableOpacity
              onPress={onClose}
              disabled={result === 'throwing'}
              className="bg-white/10 rounded-full w-8 h-8 items-center justify-center"
            >
              <Text className="text-white font-bold">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Pokémon */}
          <Animated.View
            style={{ transform: [{ scale: scaleAnim }] }}
            className="items-center mb-4"
          >
            <Image
              source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
              style={{ width: 140, height: 140 }}
              resizeMode="contain"
            />
            <View className="flex-row gap-2 mt-2">
              {pokemon.types.map(t => (
                <View key={t.type.name} className="bg-white/10 px-3 py-1 rounded-full">
                  <Text className="text-gray-300 text-xs capitalize">{t.type.name}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Resultado */}
          {result === 'success' && (
            <View className="bg-emerald-500/20 border border-emerald-500 rounded-2xl p-3 mb-4 items-center">
              <Text className="text-emerald-400 font-bold text-lg">
                ✅ ¡{pokemon.name} fue capturado!
              </Text>
            </View>
          )}
          {result === 'fail' && (
            <View className="bg-red-500/20 border border-red-500 rounded-2xl p-3 mb-4 items-center">
              <Text className="text-red-400 font-bold">
                💨 ¡{pokemon.name} escapó! Intenta de nuevo
              </Text>
            </View>
          )}
          {result === 'no_balls' && (
            <View className="bg-yellow-500/20 border border-yellow-500 rounded-2xl p-3 mb-4 items-center">
              <Text className="text-yellow-400 font-bold">
                ⚠️ No tienes {config.label}s. Visita la tienda.
              </Text>
            </View>
          )}

          {/* Selector de Pokébola */}
          <Text className="text-gray-400 text-sm mb-3">Selecciona Pokébola:</Text>
          <View className="flex-row gap-2 mb-4">
            {(Object.keys(POKEBALL_CONFIG) as PokeballType[]).map(type => {
              const cfg   = POKEBALL_CONFIG[type];
              const count = pokeballs[type];
              const isSel = selected === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelected(type)}
                  disabled={result === 'throwing' || result === 'success'}
                  className={`flex-1 rounded-2xl p-3 items-center border-2 ${
                    isSel ? 'border-white bg-white/10' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <Text className="text-2xl">{cfg.emoji}</Text>
                  <Text className="text-white text-xs font-bold mt-1">{cfg.label}</Text>
                  <Text className="text-gray-400 text-xs">{count} restantes</Text>
                  <Text className="text-emerald-400 text-xs mt-1">
                    {Math.round(cfg.probability * 100)}%
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Botón lanzar */}
          {result !== 'success' && (
            <TouchableOpacity
              onPress={handleThrow}
              disabled={result === 'throwing'}
              className={`py-4 rounded-2xl items-center border-2 ${
                result === 'throwing'
                  ? 'bg-gray-600 border-gray-700'
                  : 'bg-red-600 border-red-800'
              }`}
            >
              <Text className="text-white font-bold text-lg">
                {result === 'throwing' ? '⏳ Lanzando...' :
                 result === 'fail'     ? `🔄 Lanzar ${config.emoji} de nuevo` :
                 `🎯 Lanzar ${config.emoji}`}
              </Text>
            </TouchableOpacity>
          )}

          {result === 'success' && (
            <TouchableOpacity
              onPress={onClose}
              className="bg-emerald-600 py-4 rounded-2xl items-center border-2 border-emerald-800"
            >
              <Text className="text-white font-bold text-lg">¡Genial! Ver mi equipo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}