import { SoundService } from '@/lib/core/audio/sounds';
import { POKEBALL_CONFIG, PokeballType } from '@/lib/core/types/game.types';
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

type CaptureResult = 'idle' | 'throwing' | 'shaking' | 'success' | 'fail' | 'no_balls';

interface CaptureModalProps {
  visible:   boolean;
  pokemon:   Pokemon | null;
  pokeballs: Record<PokeballType, number>;
  onCapture: (ballType: PokeballType) => CaptureResult;
  onClose:   () => void;
}

export default function CaptureModal({
  visible,
  pokemon,
  pokeballs,
  onCapture,
  onClose,
}: CaptureModalProps) {
  const [result, setResult]     = useState<CaptureResult>('idle');
  const [selected, setSelected] = useState<PokeballType>('normal');

  // ── Animaciones ──────────────────────────────────────────────────────────

  // Pokémon: escala (se encoge al ser capturado) y opacidad
  const pokemonScale   = useRef(new Animated.Value(1)).current;
  const pokemonOpacity = useRef(new Animated.Value(1)).current;

  // Pokébola: posición Y (lanzamiento) y rotación
  const ballY          = useRef(new Animated.Value(0)).current;
  const ballX          = useRef(new Animated.Value(0)).current;
  const ballRotate     = useRef(new Animated.Value(0)).current;
  const ballScale      = useRef(new Animated.Value(0)).current;   // empieza invisible

  // Temblor de la Pokébola (3 sacudidas)
  const ballShake      = useRef(new Animated.Value(0)).current;

  // Estrella de éxito
  const starScale      = useRef(new Animated.Value(0)).current;
  const starOpacity    = useRef(new Animated.Value(0)).current;

  // ── Reset al abrir ───────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      setResult('idle');
      pokemonScale.setValue(1);
      pokemonOpacity.setValue(1);
      ballY.setValue(0);
      ballX.setValue(0);
      ballRotate.setValue(0);
      ballScale.setValue(0);
      ballShake.setValue(0);
      starScale.setValue(0);
      starOpacity.setValue(0);
    }
  }, [visible]);

  // ── Animación de lanzamiento ─────────────────────────────────────────────
  const animateThrow = (): Promise<void> =>
    new Promise(resolve => {
      Animated.parallel([
        // Pokébola aparece y vuela hacia arriba
        Animated.timing(ballScale, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(ballY, { toValue: -180, duration: 600, useNativeDriver: true }),
        Animated.timing(ballX, { toValue: 20,   duration: 600, useNativeDriver: true }),
        Animated.timing(ballRotate, { toValue: 3, duration: 600, useNativeDriver: true }),
      ]).start(() => resolve());
    });

  // ── Pokémon se encoge al ser golpeado ─────────────────────────────────────
  const animatePokemonHit = (): Promise<void> =>
    new Promise(resolve => {
      Animated.sequence([
        Animated.timing(pokemonScale,   { toValue: 0.1, duration: 400, useNativeDriver: true }),
        Animated.timing(pokemonOpacity, { toValue: 0,   duration: 200, useNativeDriver: true }),
      ]).start(() => resolve());
    });

  // ── Temblor: 3 sacudidas ──────────────────────────────────────────────────
  const animateShakes = (): Promise<void> =>
    new Promise(resolve => {
      const shake = (intensity: number) =>
        Animated.sequence([
          Animated.timing(ballShake, { toValue:  intensity, duration: 150, useNativeDriver: true }),
          Animated.timing(ballShake, { toValue: -intensity, duration: 150, useNativeDriver: true }),
          Animated.timing(ballShake, { toValue:  0,         duration: 150, useNativeDriver: true }),
        ]);

      Animated.sequence([
        Animated.delay(300),
        shake(12),
        Animated.delay(400),
        shake(10),
        Animated.delay(400),
        shake(8),
        Animated.delay(600),
      ]).start(() => resolve());
    });

  // ── Estrella de éxito ─────────────────────────────────────────────────────
  const animateStar = () => {
    Animated.parallel([
      Animated.spring(starScale,   { toValue: 1, useNativeDriver: true, tension: 50, friction: 5 }),
      Animated.timing(starOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  // ── Pokébola escapa ───────────────────────────────────────────────────────
  const animateEscape = () => {
    Animated.parallel([
      Animated.timing(ballY, { toValue: 200, duration: 500, useNativeDriver: true }),
      Animated.timing(ballOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    // Pokémon reaparece
    Animated.parallel([
      Animated.spring(pokemonScale,   { toValue: 1, useNativeDriver: true, friction: 4 }),
      Animated.timing(pokemonOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const ballOpacity = useRef(new Animated.Value(1)).current;

  // ── Flujo completo de captura ─────────────────────────────────────────────
  const handleThrow = async () => {
    if (result === 'throwing' || result === 'shaking' || result === 'success') return;

    setResult('throwing');
    ballOpacity.setValue(1);

    // 1. Sonido de lanzamiento + animación
    await SoundService.throwBall();
    await animateThrow();

    // 2. Pokémon golpeado — se encoge
    await animatePokemonHit();

    // 3. Temblores
    setResult('shaking');
    const outcome = onCapture(selected);

    await animateShakes();

    // 4. Resultado
    if (outcome === 'success') {
      setResult('success');
      await SoundService.captureSuccess();
      animateStar();
    } else if (outcome === 'fail') {
      setResult('fail');
      await SoundService.captureFail();
      animateEscape();
    } else {
      setResult(outcome);
    }
  };

  const handleSelectBall = (type: PokeballType) => {
    setSelected(type);
    SoundService.tap();
  };

  if (!pokemon) return null;

  const cfg          = POKEBALL_CONFIG[selected];
  const ballRotateDeg = ballRotate.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const ballShakeDeg = ballShake.interpolate({
    inputRange:  [-12, 12],
    outputRange: ['-12deg', '12deg'],
  });

  const isActive = result === 'throwing' || result === 'shaking';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 justify-end">
        <View className="bg-gray-950 rounded-t-3xl border-t border-white/10" style={{ minHeight: 520 }}>

          {/* Header */}
          <View className="flex-row justify-between items-center px-5 pt-5 pb-3 border-b border-white/10">
            <View>
              <Text className="text-white font-bold text-lg capitalize">
                ¡{pokemon.name} salvaje!
              </Text>
              <Text className="text-gray-400 text-xs">
                {pokemon.types.map(t => t.type.name).join(' / ')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              disabled={isActive}
              className="bg-white/10 rounded-full w-9 h-9 items-center justify-center"
            >
              <Text className="text-white font-bold">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Arena de combate */}
          <View className="items-center justify-center py-6" style={{ height: 220 }}>

            {/* Pokémon */}
            <Animated.View
              style={{
                transform: [{ scale: pokemonScale }],
                opacity:   pokemonOpacity,
                position:  'absolute',
                top: 10,
              }}
            >
              <Image
                source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
                style={{ width: 150, height: 150 }}
                resizeMode="contain"
              />
            </Animated.View>

            {/* Estrella de captura exitosa */}
            <Animated.View
              style={{
                transform: [{ scale: starScale }],
                opacity:   starOpacity,
                position:  'absolute',
                top: 20,
              }}
            >
              <Text style={{ fontSize: 80 }}>⭐</Text>
            </Animated.View>

            {/* Pokébola animada */}
            {result !== 'idle' && (
              <Animated.View
                style={{
                  position:  'absolute',
                  bottom:    20,
                  transform: [
                    { translateY:  ballY        },
                    { translateX:  ballX        },
                    { rotate:      result === 'shaking' ? ballShakeDeg : ballRotateDeg },
                    { scale:       ballScale    },
                  ],
                  opacity: ballOpacity,
                }}
              >
                <Image
                  source={{ uri: POKEBALL_CONFIG[selected].imageUrl }}
                  style={{ width: 56, height: 56 }}
                  resizeMode="contain"
                />
              </Animated.View>
            )}
          </View>

          {/* Resultado */}
          {result === 'success' && (
            <View className="mx-5 bg-emerald-500/20 border border-emerald-500 rounded-2xl p-3 mb-3 items-center">
              <Text className="text-emerald-400 font-bold text-base">
                ✅ ¡{pokemon.name} fue capturado!
              </Text>
            </View>
          )}
          {result === 'fail' && (
            <View className="mx-5 bg-red-500/20 border border-red-500 rounded-2xl p-3 mb-3 items-center">
              <Text className="text-red-400 font-bold">
                💨 ¡{pokemon.name} escapó! Intenta de nuevo
              </Text>
            </View>
          )}
          {result === 'no_balls' && (
            <View className="mx-5 bg-yellow-500/20 border border-yellow-500 rounded-2xl p-3 mb-3 items-center">
              <Text className="text-yellow-400 font-bold">
                ⚠️ No tienes {cfg.label}s. Visita la tienda.
              </Text>
            </View>
          )}

          {/* Selector de Pokébola */}
          <View className="px-5 mb-4">
            <Text className="text-gray-400 text-xs mb-2 font-semibold uppercase tracking-widest">
              Selecciona Pokébola
            </Text>
            <View className="flex-row gap-2">
              {(Object.keys(POKEBALL_CONFIG) as PokeballType[]).map(type => {
                const c     = POKEBALL_CONFIG[type];
                const count = pokeballs[type];
                const isSel = selected === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => handleSelectBall(type)}
                    disabled={isActive || result === 'success'}
                    className={`flex-1 rounded-2xl p-3 items-center border-2 ${
                      isSel
                        ? 'border-white bg-white/10'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    {/* Imagen real de la Pokébola */}
                    <Image
                      source={{ uri: c.imageUrl }}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                    <Text className="text-white text-xs font-bold mt-1">{c.label}</Text>
                    <Text className="text-gray-400 text-xs">{count} restantes</Text>
                    <View
                      className="mt-1 px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${c.color}30`, borderWidth: 1, borderColor: c.color }}
                    >
                      <Text style={{ color: c.color, fontSize: 10, fontWeight: '700' }}>
                        {Math.round(c.probability * 100)}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Botón de acción */}
          <View className="px-5 pb-8">
            {result !== 'success' ? (
              <TouchableOpacity
                onPress={handleThrow}
                disabled={isActive}
                className={`py-4 rounded-2xl items-center border-2 ${
                  isActive
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-red-600 border-red-800'
                }`}
              >
                <View className="flex-row items-center gap-2">
                  {!isActive && (
                    <Image
                      source={{ uri: cfg.imageUrl }}
                      style={{ width: 24, height: 24 }}
                      resizeMode="contain"
                    />
                  )}
                  <Text className="text-white font-bold text-lg">
                    {isActive        ? '⏳ Lanzando...' :
                     result === 'fail' ? `Lanzar ${cfg.label} de nuevo` :
                     `¡Lanzar ${cfg.label}!`}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={onClose}
                className="bg-emerald-600 py-4 rounded-2xl items-center border-2 border-emerald-800"
              >
                <Text className="text-white font-bold text-lg">
                  🎉 ¡Genial! Ver mi equipo
                </Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
}