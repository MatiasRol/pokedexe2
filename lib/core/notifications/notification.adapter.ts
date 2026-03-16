/**
 * 🔔 notification.adapter.ts — Capa de Infraestructura
 *
 * Patrón de la guía: este archivo habla directamente con el SO.
 * Configura canales, pide permisos y expone métodos de envío local.
 * NO contiene lógica de negocio.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ─── 1. Configuración global (igual que la guía) ──────────────────────────────
// Llamar UNA sola vez al iniciar la app

export function setupNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert:  true,   // Muestra alerta visual
      shouldPlaySound:  true,   // Reproduce sonido
      shouldSetBadge:   false,  // No altera el contador rojo del ícono
      shouldShowBanner: true,   // Banner deslizable (iOS)
      shouldShowList:   true,   // Visible en centro de notificaciones (iOS)
    }),
  });
}

// ─── 2. Canal Android (requerido desde Android 8.0) ──────────────────────────

export async function setupAndroidChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('pokedex', {
    name: 'Pokédex',
    description: 'Notificaciones de la app Pokédex',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#EF4444', // Rojo Pokédex
    sound: 'default',
  });
}

// ─── 3. Solicitar permisos ────────────────────────────────────────────────────

export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();

  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── 4. Métodos de envío local ────────────────────────────────────────────────

export interface LocalNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channelId?: string;
}

/** Envía una notificación local inmediata */
export async function sendLocalNotification(
  payload: LocalNotificationPayload
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: payload.title,
      body:  payload.body,
      data:  payload.data ?? {},
      sound: 'default',
    },
    trigger: null, // null = inmediata
    ...(Platform.OS === 'android' && {
      identifier: undefined,
    }),
  });
}

/** Programa una notificación para una hora específica (daily) */
export async function scheduledailyNotification(
  payload: LocalNotificationPayload,
  hour: number,
  minute: number
): Promise<string> {
  // Cancela cualquier notificación diaria previa con el mismo identifier
  await Notifications.cancelScheduledNotificationAsync('daily-pokemon').catch(() => {});

  return await Notifications.scheduleNotificationAsync({
    identifier: 'daily-pokemon',
    content: {
      title: payload.title,
      body:  payload.body,
      data:  payload.data ?? {},
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/** Cancela todas las notificaciones programadas */
export async function cancelAllScheduled(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── 5. Listeners ─────────────────────────────────────────────────────────────

export type NotificationListener = (
  notification: Notifications.Notification
) => void;

export type ResponseListener = (
  response: Notifications.NotificationResponse
) => void;

export function addNotificationReceivedListener(
  handler: NotificationListener
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(handler);
}

export function addNotificationResponseListener(
  handler: ResponseListener
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}