import { useNotifications } from '@/lib/modules/notifications/useNotifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const amount = params.amount as string ?? '0.00';
  const last4  = params.last4  as string ?? '****';

  // ── Notificaciones ────────────────────────────────────────────────────────
  const { notifyPaymentSuccess } = useNotifications();

  // ── Animaciones ───────────────────────────────────────────────────────────
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Lanzar animaciones y notificación en paralelo
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 6 }),
      Animated.parallel([
        Animated.timing(opacAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    // 🔔 Notificación de pago confirmado
    notifyPaymentSuccess(amount, last4);
  }, []);

  // ── Datos de la transacción ───────────────────────────────────────────────
  const txId = `TXN${Date.now().toString().slice(-8).toUpperCase()}`;
  const now  = new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <View className="flex-1 bg-emerald-600 items-center justify-center px-6">

      {/* Ícono principal */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View className="bg-white rounded-full w-32 h-32 items-center justify-center shadow-2xl mb-8">
          <Text className="text-7xl">✅</Text>
        </View>
      </Animated.View>

      {/* Contenido animado */}
      <Animated.View
        style={{ opacity: opacAnim, transform: [{ translateY: slideAnim }] }}
        className="items-center w-full"
      >
        <Text className="text-white text-4xl font-bold mb-2">¡Pago Exitoso!</Text>
        <Text className="text-emerald-100 text-lg mb-8">
          Tu pedido fue procesado correctamente
        </Text>

        {/* Tarjeta resumen */}
        <View className="bg-white rounded-3xl p-6 w-full shadow-xl mb-8">
          {/* Monto */}
          <View className="items-center mb-5 pb-5 border-b border-gray-100">
            <Text className="text-gray-400 text-sm mb-1">Total pagado</Text>
            <Text className="text-emerald-600 text-5xl font-bold">${amount}</Text>
          </View>

          {/* Detalles */}
          {[
            { label: 'Tarjeta',        value: `•••• •••• •••• ${last4}` },
            { label: 'ID Transacción', value: txId,          mono: true  },
            { label: 'Fecha y hora',   value: now                        },
            { label: 'Estado',         value: '✅ Aprobado', green: true },
          ].map(({ label, value, mono, green }) => (
            <View key={label} className="flex-row justify-between items-center py-2">
              <Text className="text-gray-400 text-sm">{label}</Text>
              <Text
                className={`font-semibold text-sm ${
                  green ? 'text-emerald-600' : 'text-gray-800'
                } ${mono ? 'font-mono' : ''}`}
              >
                {value}
              </Text>
            </View>
          ))}
        </View>

        {/* Acciones */}
        <TouchableOpacity
          onPress={() => router.replace('/pokedex')}
          className="bg-white w-full py-4 rounded-2xl items-center shadow-lg mb-3"
        >
          <Text className="text-emerald-700 font-bold text-lg">🎮 Volver al Pokédex</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/checkout')}
          className="border-2 border-white/40 w-full py-4 rounded-2xl items-center"
        >
          <Text className="text-white font-semibold">Hacer otra compra</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}