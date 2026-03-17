/**
 * 🔊 sounds.ts
 *
 * Servicio de audio y háptica para la app.
 * Usa expo-av para sonidos y expo-haptics para vibración.
 *
 * Los archivos de sonido se cargan desde URLs públicas
 * (no requieren assets locales).
 */

import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// ─── URLs de sonidos (libres de derechos, hosted) ─────────────────────────────
// Usamos la API de mixkit.co que tiene efectos de sonido gratuitos
const SOUNDS = {
  // Lanzar Pokébola
  throw:   'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  // Captura exitosa — sonido de éxito
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  // Pokémon escapa — sonido de fallo
  fail:    'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
  // Compra en tienda
  buy:     'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3',
  // Monedas
  coins:   'https://assets.mixkit.co/active_storage/sfx/33/33-preview.mp3',
};

// Cache de sonidos cargados
const soundCache: Partial<Record<keyof typeof SOUNDS, Audio.Sound>> = {};

// ─── Configurar modo de audio ─────────────────────────────────────────────────
export async function setupAudio() {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS:   false,
      playsInSilentModeIOS: false,  // respeta el modo silencio del iPhone
      shouldDuckAndroid:    true,
    });
  } catch {
    // Si falla, continúa sin audio
  }
}

// ─── Reproducir sonido ────────────────────────────────────────────────────────
async function playSound(key: keyof typeof SOUNDS, volume = 1.0) {
  try {
    // Reusar del cache si ya está cargado
    if (soundCache[key]) {
      await soundCache[key]!.setPositionAsync(0);
      await soundCache[key]!.setVolumeAsync(volume);
      await soundCache[key]!.playAsync();
      return;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: SOUNDS[key] },
      { shouldPlay: true, volume }
    );

    soundCache[key] = sound;

    // Liberar cuando termina
    sound.setOnPlaybackStatusUpdate(status => {
      if (status.isLoaded && status.didJustFinish) {
        // No descargamos para reusar en próximas llamadas
      }
    });
  } catch {
    // Si falla el audio, continuamos silenciosamente
  }
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const SoundService = {
  // Lanzar Pokébola
  throwBall: async () => {
    await Promise.all([
      playSound('throw', 0.6),
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    ]);
  },

  // Captura exitosa
  captureSuccess: async () => {
    await Promise.all([
      playSound('success', 0.8),
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    ]);
  },

  // Pokémon escapa
  captureFail: async () => {
    await Promise.all([
      playSound('fail', 0.6),
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    ]);
  },

  // Compra en tienda
  purchase: async () => {
    await Promise.all([
      playSound('coins', 0.7),
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    ]);
  },

  // Vender Pokémon
  sell: async () => {
    await Promise.all([
      playSound('buy', 0.6),
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    ]);
  },

  // Solo vibración (para acciones menores)
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  // Liberar todos los sonidos cacheados
  unloadAll: async () => {
    for (const key of Object.keys(soundCache) as (keyof typeof SOUNDS)[]) {
      try {
        await soundCache[key]?.unloadAsync();
        delete soundCache[key];
      } catch { /* ignorar */ }
    }
  },
};