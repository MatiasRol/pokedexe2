import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Tipos de tarjeta
const CARD_BRANDS: Record<string, { icon: string; color: string }> = {
  visa:       { icon: '💳', color: '#1a1f71' },
  mastercard: { icon: '💳', color: '#eb001b' },
  amex:       { icon: '💳', color: '#007bc1' },
  default:    { icon: '💳', color: '#6b7280' },
};

function detectBrand(num: string): string {
  if (num.startsWith('4'))                       return 'visa';
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'mastercard';
  if (/^3[47]/.test(num))                        return 'amex';
  return 'default';
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

// Productos de ejemplo (Pokémon mercancía)
const PRODUCTS = [
  { id: 1, name: 'Figura Coleccionable',  price: 24.99, emoji: '🗿' },
  { id: 2, name: 'Tarjeta Holográfica',    price: 9.99,  emoji: '✨' },
  { id: 3, name: 'Pokébola Premium',       price: 14.99, emoji: '⚽' },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scannedData = params.scannedData as string | undefined;

  // Estado del carrito
  const [quantities, setQuantities] = useState<Record<number, number>>({ 1: 1 });

  // Estado del formulario
  const [step, setStep] = useState<'cart' | 'payment' | 'processing'>('cart');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Animación de procesamiento
  const spinAnim = useRef(new Animated.Value(0)).current;

  const total = PRODUCTS.reduce((sum, p) => {
    return sum + p.price * (quantities[p.id] ?? 0);
  }, 0);

  const itemCount = Object.values(quantities).reduce((a, b) => a + b, 0);

  // ─── Carrito ────────────────────────────────────────────────────────────────

  const updateQty = (id: number, delta: number) => {
    setQuantities(prev => {
      const next = (prev[id] ?? 0) + delta;
      if (next <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  // ─── Validación ─────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const digits = card.number.replace(/\s/g, '');

    if (digits.length < 13)          errs.number = 'Número de tarjeta inválido';
    if (card.expiry.length < 5)      errs.expiry = 'Fecha inválida (MM/AA)';
    if (card.cvv.length < 3)         errs.cvv    = 'CVV inválido';
    if (card.name.trim().length < 3) errs.name   = 'Nombre requerido';

    // Validar fecha
    if (!errs.expiry) {
      const [mm, yy] = card.expiry.split('/');
      const now = new Date();
      const exp = new Date(2000 + parseInt(yy), parseInt(mm) - 1);
      if (exp < now) errs.expiry = 'Tarjeta vencida';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Pago ────────────────────────────────────────────────────────────────────

  const handlePay = () => {
    if (!validate()) return;
    setStep('processing');

    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
    ).start();

    // Simulación del proceso de pago (en producción: llamar tu backend → Stripe)
    setTimeout(() => {
      router.replace({
        pathname: '/payment-success',
        params: {
          amount: total.toFixed(2),
          last4: card.number.replace(/\s/g, '').slice(-4),
        },
      });
    }, 2800);
  };

  const brand = detectBrand(card.number.replace(/\s/g, ''));

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (step === 'processing') {
    return (
      <View className="flex-1 bg-indigo-950 items-center justify-center">
        <View className="bg-white/10 rounded-3xl p-10 items-center border border-white/20 mx-6">
          <Text className="text-6xl mb-5">⏳</Text>
          <Text className="text-white text-2xl font-bold mb-2">Procesando pago</Text>
          <Text className="text-indigo-300 text-base text-center">
            Comunicando con el servidor seguro…
          </Text>

          {/* Barra de progreso animada */}
          <View className="w-full bg-white/10 rounded-full h-2 mt-8 overflow-hidden">
            <Animated.View
              style={{
                height: '100%',
                borderRadius: 99,
                backgroundColor: '#6366f1',
                width: '80%',
              }}
            />
          </View>
          <Text className="text-indigo-400 text-xs mt-3">
            🔒 Conexión cifrada SSL/TLS
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ─── Header ─── */}
        <View className="bg-indigo-700 pt-14 pb-6 px-5">
          <View className="flex-row items-center gap-3 mb-1">
            <TouchableOpacity
              onPress={() => step === 'payment' ? setStep('cart') : router.back()}
              className="bg-white/20 rounded-full w-9 h-9 items-center justify-center"
            >
              <Text className="text-white font-bold">←</Text>
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">
              {step === 'cart' ? '🛒 Carrito' : '💳 Pago Seguro'}
            </Text>
          </View>

          {/* Pasos */}
          <View className="flex-row items-center mt-4 gap-1">
            {['Carrito', 'Pago', 'Listo'].map((label, i) => (
              <View key={i} className="flex-1 items-center">
                <View
                  className={`w-7 h-7 rounded-full items-center justify-center ${
                    i < (step === 'cart' ? 1 : 2) ? 'bg-white' : 'bg-white/25'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      i < (step === 'cart' ? 1 : 2) ? 'text-indigo-700' : 'text-white'
                    }`}
                  >
                    {i + 1}
                  </Text>
                </View>
                <Text className="text-white/60 text-xs mt-1">{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="px-4 py-5">

          {/* ──────────── PASO 1: CARRITO ──────────── */}
          {step === 'cart' && (
            <>
              {/* Datos escaneados (opcional) */}
              {scannedData && (
                <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 flex-row items-center gap-3">
                  <Text className="text-2xl">📲</Text>
                  <View className="flex-1">
                    <Text className="text-emerald-800 font-bold text-sm">Desde escáner</Text>
                    <Text className="text-emerald-600 text-xs" numberOfLines={1}>{scannedData}</Text>
                  </View>
                </View>
              )}

              {/* Productos */}
              <Text className="text-gray-800 font-bold text-lg mb-3">Productos</Text>
              {PRODUCTS.map(product => (
                <View
                  key={product.id}
                  className="bg-white rounded-2xl p-4 mb-3 flex-row items-center border border-gray-100 shadow-sm"
                >
                  <Text className="text-4xl mr-4">{product.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-gray-800 font-semibold">{product.name}</Text>
                    <Text className="text-indigo-600 font-bold">${product.price.toFixed(2)}</Text>
                  </View>
                  {/* Controles cantidad */}
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={() => updateQty(product.id, -1)}
                      className="bg-gray-100 w-8 h-8 rounded-full items-center justify-center border border-gray-200"
                    >
                      <Text className="text-gray-600 font-bold">−</Text>
                    </TouchableOpacity>
                    <Text className="text-gray-800 font-bold w-5 text-center">
                      {quantities[product.id] ?? 0}
                    </Text>
                    <TouchableOpacity
                      onPress={() => updateQty(product.id, 1)}
                      className="bg-indigo-600 w-8 h-8 rounded-full items-center justify-center"
                    >
                      <Text className="text-white font-bold">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Resumen */}
              <View className="bg-indigo-50 rounded-2xl p-4 mb-6 border border-indigo-100">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-500">Subtotal ({itemCount} items)</Text>
                  <Text className="text-gray-700 font-semibold">${total.toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-500">Envío</Text>
                  <Text className="text-emerald-600 font-semibold">GRATIS</Text>
                </View>
                <View className="h-px bg-indigo-200 my-2" />
                <View className="flex-row justify-between">
                  <Text className="text-gray-800 font-bold text-lg">Total</Text>
                  <Text className="text-indigo-700 font-bold text-xl">${total.toFixed(2)}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setStep('payment')}
                disabled={itemCount === 0}
                className={`py-4 rounded-2xl items-center ${
                  itemCount === 0 ? 'bg-gray-300' : 'bg-indigo-600'
                }`}
              >
                <Text className="text-white font-bold text-lg">
                  {itemCount === 0 ? 'Agrega productos' : `Pagar $${total.toFixed(2)} →`}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* ──────────── PASO 2: PAGO ──────────── */}
          {step === 'payment' && (
            <>
              {/* Vista previa de tarjeta */}
              <View
                className="rounded-3xl p-6 mb-6 min-h-[170px] justify-between"
                style={{ backgroundColor: brand === 'visa' ? '#1a1f71' : brand === 'mastercard' ? '#1a1a2e' : '#0f2044' }}
              >
                <View className="flex-row justify-between items-start">
                  <View className="bg-white/10 rounded-lg px-3 py-1">
                    <Text className="text-white/60 text-xs font-bold uppercase">
                      {brand === 'default' ? 'TARJETA' : brand.toUpperCase()}
                    </Text>
                  </View>
                  <Text className="text-white text-3xl">
                    {CARD_BRANDS[brand].icon}
                  </Text>
                </View>

                <View>
                  <Text className="text-white/40 text-xs mb-1 font-mono">NÚMERO</Text>
                  <Text className="text-white text-xl font-mono tracking-widest">
                    {card.number || '•••• •••• •••• ••••'}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-white/40 text-xs mb-1">TITULAR</Text>
                    <Text className="text-white font-semibold uppercase">
                      {card.name || 'NOMBRE APELLIDO'}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-white/40 text-xs mb-1">VENCE</Text>
                    <Text className="text-white font-semibold">
                      {card.expiry || 'MM/AA'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Formulario */}
              <Text className="text-gray-800 font-bold text-lg mb-4">Datos de Tarjeta</Text>

              {/* Número */}
              <View className="mb-4">
                <Text className="text-gray-600 font-semibold mb-2 text-sm">Número de Tarjeta</Text>
                <View className="flex-row items-center bg-white border-2 rounded-2xl px-4 py-3 border-gray-200">
                  <TextInput
                    value={card.number}
                    onChangeText={t => setCard(p => ({ ...p, number: formatCardNumber(t) }))}
                    placeholder="1234 5678 9012 3456"
                    keyboardType="number-pad"
                    maxLength={19}
                    className="flex-1 text-gray-800 font-mono text-base"
                    placeholderTextColor="#9ca3af"
                  />
                  <Text className="text-xl ml-2">{CARD_BRANDS[brand].icon}</Text>
                </View>
                {errors.number && <Text className="text-red-500 text-xs mt-1 ml-2">⚠️ {errors.number}</Text>}
              </View>

              {/* Nombre */}
              <View className="mb-4">
                <Text className="text-gray-600 font-semibold mb-2 text-sm">Nombre del Titular</Text>
                <TextInput
                  value={card.name}
                  onChangeText={t => setCard(p => ({ ...p, name: t.toUpperCase() }))}
                  placeholder="NOMBRE COMO EN LA TARJETA"
                  autoCapitalize="characters"
                  className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 font-semibold"
                  placeholderTextColor="#9ca3af"
                />
                {errors.name && <Text className="text-red-500 text-xs mt-1 ml-2">⚠️ {errors.name}</Text>}
              </View>

              {/* Fecha + CVV */}
              <View className="flex-row gap-3 mb-6">
                <View className="flex-1">
                  <Text className="text-gray-600 font-semibold mb-2 text-sm">Vencimiento</Text>
                  <TextInput
                    value={card.expiry}
                    onChangeText={t => setCard(p => ({ ...p, expiry: formatExpiry(t) }))}
                    placeholder="MM/AA"
                    keyboardType="number-pad"
                    maxLength={5}
                    className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 font-mono text-center text-base"
                    placeholderTextColor="#9ca3af"
                  />
                  {errors.expiry && <Text className="text-red-500 text-xs mt-1">⚠️ {errors.expiry}</Text>}
                </View>
                <View className="flex-1">
                  <Text className="text-gray-600 font-semibold mb-2 text-sm">CVV</Text>
                  <TextInput
                    value={card.cvv}
                    onChangeText={t => setCard(p => ({ ...p, cvv: t.replace(/\D/g, '').slice(0, 4) }))}
                    placeholder="•••"
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={4}
                    className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 font-mono text-center text-base"
                    placeholderTextColor="#9ca3af"
                  />
                  {errors.cvv && <Text className="text-red-500 text-xs mt-1">⚠️ {errors.cvv}</Text>}
                </View>
              </View>

              {/* Sello de seguridad */}
              <View className="bg-gray-50 rounded-2xl p-3 mb-6 flex-row items-center gap-3 border border-gray-200">
                <Text className="text-2xl">🔒</Text>
                <Text className="text-gray-500 text-xs flex-1">
                  Tus datos están cifrados con SSL 256-bit. No almacenamos información de tu tarjeta.
                </Text>
              </View>

              {/* Botón pagar */}
              <TouchableOpacity
                onPress={handlePay}
                className="bg-indigo-600 py-5 rounded-2xl items-center shadow-lg"
              >
                <Text className="text-white font-bold text-lg">
                  🔐 Pagar ${total.toFixed(2)}
                </Text>
              </TouchableOpacity>

              {/* Métodos aceptados */}
              <View className="flex-row justify-center gap-3 mt-5 pb-6">
                {['💳 Visa', '💳 MC', '💳 Amex'].map(m => (
                  <View key={m} className="bg-gray-100 px-3 py-1 rounded-lg">
                    <Text className="text-gray-500 text-xs">{m}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}