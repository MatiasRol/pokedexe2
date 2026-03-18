import { SoundService } from '@/lib/core/audio/sounds';
import { POKEBALL_CONFIG, PokeballType } from '@/lib/core/types/game.types';
import { useInventory } from '@/lib/modules/game/useInventory';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Pokémon en tienda ────────────────────────────────────────────────────────
const STORE_POKEMON = [
  { id: 133, name: 'Eevee',    price: 300 },
  { id: 147, name: 'Dratini',  price: 500 },
  { id: 175, name: 'Togepi',   price: 400 },
  { id: 246, name: 'Larvitar', price: 450 },
  { id: 280, name: 'Ralts',    price: 350 },
  { id: 443, name: 'Gible',    price: 600 },
];

// ─── Paquetes de monedas ──────────────────────────────────────────────────────
const COIN_PACKS = [
  { id: 'pack1', coins: 500,  price: '$ 0.99',  bonus: '',        popular: false },
  { id: 'pack2', coins: 1200, price: '$ 1.99',  bonus: '+200',    popular: true  },
  { id: 'pack3', coins: 2500, price: '$ 3.99',  bonus: '+500',    popular: false },
  { id: 'pack4', coins: 6000, price: '$ 7.99',  bonus: '+1000',   popular: false },
];

// ─── Helpers de tarjeta ───────────────────────────────────────────────────────
function formatCardNumber(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}
function detectBrand(num: string) {
  if (num.startsWith('4'))              return { icon: '💳', label: 'Visa' };
  if (/^5[1-5]/.test(num))             return { icon: '💳', label: 'Mastercard' };
  if (/^3[47]/.test(num))              return { icon: '💳', label: 'Amex' };
  return { icon: '💳', label: 'Tarjeta' };
}

type Tab = 'pokeballs' | 'pokemon' | 'sell' | 'recharge';

export default function StoreScreen() {
  const router = useRouter();
  const { inventory, captured, buyPokeball, buyPokemon, sellPokemon, addCoins } = useInventory();
  const [activeTab, setActiveTab]     = useState<Tab>('pokeballs');
  const [feedback, setFeedback]       = useState<string | null>(null);

  // ─── Estado del pago ──────────────────────────────────────────────────────
  const [selectedPack, setSelectedPack]   = useState<string | null>(null);
  const [payStep, setPayStep]             = useState<'select' | 'card' | 'processing' | 'done'>('select');
  const [card, setCard]                   = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [cardErrors, setCardErrors]       = useState<Record<string, string>>({});
  const scaleAnim                         = useRef(new Animated.Value(0)).current;

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  // ─── Handlers tienda ──────────────────────────────────────────────────────

  const handleBuyPokeball = (type: PokeballType, qty: number) => {
    const ok = buyPokeball(type, qty);
    if (ok) SoundService.purchase(); else SoundService.tap();
    showFeedback(ok
      ? `✅ Compraste ${qty} ${POKEBALL_CONFIG[type].label}(s)`
      : '❌ No tienes suficientes monedas');
  };

  const handleBuyPokemon = async (id: number, name: string, price: number) => {
    const res  = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();
    const ok   = buyPokemon(data, price);
    showFeedback(ok ? `✅ ¡${name} se unió a tu equipo!` : '❌ No tienes suficientes monedas');
  };

  const handleSell = (uid: string, name: string, price: number) => {
    sellPokemon(uid);
    SoundService.sell();
    showFeedback(`💰 Vendiste a ${name} por ${price} monedas`);
  };

  // ─── Handlers pago ────────────────────────────────────────────────────────

  const validateCard = (): boolean => {
    const errs: Record<string, string> = {};
    const digits = card.number.replace(/\s/g, '');
    if (digits.length < 13)          errs.number = 'Número inválido';
    if (card.expiry.length < 5)      errs.expiry = 'Fecha inválida (MM/AA)';
    if (card.cvv.length < 3)         errs.cvv    = 'CVV inválido';
    if (card.name.trim().length < 3) errs.name   = 'Nombre requerido';
    if (!errs.expiry) {
      const [mm, yy] = card.expiry.split('/');
      if (new Date(2000 + parseInt(yy), parseInt(mm) - 1) < new Date())
        errs.expiry = 'Tarjeta vencida';
    }
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePay = () => {
    if (!validateCard()) return;
    setPayStep('processing');
    setTimeout(() => {
      const pack = COIN_PACKS.find(p => p.id === selectedPack);
      if (pack) addCoins(pack.coins);
      setPayStep('done');
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 6 }).start();
    }, 2500);
  };

  const resetPay = () => {
    setPayStep('select');
    setSelectedPack(null);
    setCard({ number: '', expiry: '', cvv: '', name: '' });
    setCardErrors({});
    scaleAnim.setValue(0);
  };

  const pack         = COIN_PACKS.find(p => p.id === selectedPack);
  const brand        = detectBrand(card.number.replace(/\s/g, ''));
  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: 'pokeballs', label: 'Pokébolas', emoji: '⚽' },
    { key: 'pokemon',   label: 'Pokémon',   emoji: '🌟' },
    { key: 'sell',      label: 'Vender',    emoji: '💰' },
    { key: 'recharge',  label: 'Recargar',  emoji: '🪙' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-950"
    >
      {/* ── Header ── */}
      <View className="bg-gray-900 pt-14 pb-4 px-5 border-b border-white/10">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-2xl font-bold">🛒 Tienda</Text>
          <View className="bg-yellow-500/20 border border-yellow-500 px-4 py-2 rounded-2xl">
            <Text className="text-yellow-400 font-bold">🪙 {inventory.coins}</Text>
          </View>
        </View>
        <View className="flex-row gap-2 mt-4">
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => { setActiveTab(tab.key); if (tab.key === 'recharge') resetPay(); }}
              className={`flex-1 py-2 rounded-xl items-center border ${
                activeTab === tab.key ? 'bg-red-600 border-red-800' : 'bg-white/5 border-white/10'
              }`}
            >
              <Text className="text-base">{tab.emoji}</Text>
              <Text className={`text-xs font-semibold mt-0.5 ${activeTab === tab.key ? 'text-white' : 'text-gray-400'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Feedback */}
      {feedback && (
        <View className="mx-4 mt-3 bg-gray-800 rounded-2xl px-4 py-3 border border-white/20">
          <Text className="text-white text-center font-semibold">{feedback}</Text>
        </View>
      )}

      <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">

        {/* ── POKÉBOLAS ── */}
        {activeTab === 'pokeballs' && (
          <View>
            <Text className="text-gray-400 text-sm mb-4">
              Las Pokébolas determinan la probabilidad de captura en el mapa.
            </Text>
            {(Object.keys(POKEBALL_CONFIG) as PokeballType[]).map(type => {
              const cfg = POKEBALL_CONFIG[type];
              return (
                <View key={type} className="bg-gray-900 rounded-3xl p-5 mb-3 border border-white/20">
                  <View className="flex-row items-center mb-3">
                    <Text className="text-4xl mr-4">{cfg.emoji}</Text>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-lg">{cfg.label}</Text>
                      <Text className="text-gray-400 text-sm">{Math.round(cfg.probability * 100)}% de captura</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-yellow-400 font-bold">🪙 {cfg.price}</Text>
                      <Text className="text-gray-500 text-xs">Tienes: {inventory.pokeballs[type]}</Text>
                    </View>
                  </View>
                  <View className="w-full bg-white/10 rounded-full h-2 mb-3">
                    <View className="bg-red-500 h-2 rounded-full" style={{ width: `${cfg.probability * 100}%` }} />
                  </View>
                  <View className="flex-row gap-2">
                    {[1, 3, 5].map(qty => (
                      <TouchableOpacity
                        key={qty}
                        onPress={() => handleBuyPokeball(type, qty)}
                        className="flex-1 bg-white/5 border border-white/20 py-2 rounded-xl items-center"
                      >
                        <Text className="text-white font-bold text-sm">x{qty}</Text>
                        <Text className="text-yellow-400 text-xs">🪙 {cfg.price * qty}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── COMPRAR POKÉMON ── */}
        {activeTab === 'pokemon' && (
          <View>
            <Text className="text-gray-400 text-sm mb-4">Pokémon disponibles para tu equipo.</Text>
            <View className="flex-row flex-wrap gap-3">
              {STORE_POKEMON.map(item => (
                <View key={item.id} className="bg-gray-900 rounded-3xl p-4 items-center border border-white/20" style={{ width: '47%' }}>
                  <Image
                    source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png` }}
                    style={{ width: 80, height: 80 }}
                    resizeMode="contain"
                  />
                  <Text className="text-white font-bold capitalize mt-2">{item.name}</Text>
                  <Text className="text-yellow-400 text-sm mt-1">🪙 {item.price}</Text>
                  <TouchableOpacity
                    onPress={() => handleBuyPokemon(item.id, item.name, item.price)}
                    className="mt-3 bg-red-600 px-4 py-2 rounded-xl border border-red-800 w-full items-center"
                  >
                    <Text className="text-white font-bold text-sm">Comprar</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── VENDER ── */}
        {activeTab === 'sell' && (
          <View>
            {captured.length === 0 ? (
              <View className="items-center py-16">
                <Text className="text-5xl mb-4">🎒</Text>
                <Text className="text-white font-bold text-lg mb-2">Sin Pokémon para vender</Text>
                <Text className="text-gray-400 text-sm text-center">Captura Pokémon en el mapa.</Text>
                <TouchableOpacity onPress={() => router.push('/(app)/map')} className="mt-6 bg-red-600 px-6 py-3 rounded-2xl border border-red-800">
                  <Text className="text-white font-bold">🗺️ Ir al Mapa</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text className="text-gray-400 text-sm mb-4">{captured.length} Pokémon en tu equipo.</Text>
                {captured.map(entry => (
                  <View key={entry.uid} className="bg-gray-900 rounded-2xl p-4 mb-3 flex-row items-center border border-white/20">
                    <Image source={{ uri: entry.pokemon.sprites.other['official-artwork'].front_default }} style={{ width: 56, height: 56 }} resizeMode="contain" />
                    <View className="flex-1 ml-3">
                      <Text className="text-white font-bold capitalize">{entry.pokemon.name}</Text>
                      <Text className="text-gray-400 text-xs mt-1">{POKEBALL_CONFIG[entry.pokeball].emoji} {POKEBALL_CONFIG[entry.pokeball].label}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleSell(entry.uid, entry.pokemon.name, entry.sellPrice)} className="bg-yellow-500/20 border border-yellow-500 px-3 py-2 rounded-xl">
                      <Text className="text-yellow-400 font-bold text-xs">🪙 {entry.sellPrice}</Text>
                      <Text className="text-yellow-400 text-xs text-center">Vender</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── RECARGAR MONEDAS ── */}
        {activeTab === 'recharge' && (
          <View>

            {/* PASO 1: Seleccionar paquete */}
            {payStep === 'select' && (
              <View>
                <Text className="text-gray-400 text-sm mb-4">
                  Compra monedas para adquirir Pokébolas y Pokémon en la tienda.
                </Text>
                {COIN_PACKS.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setSelectedPack(p.id)}
                    className={`rounded-3xl p-5 mb-3 border ${
                      selectedPack === p.id
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-white/10 bg-gray-900'
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        {p.popular && (
                          <View className="bg-red-600 px-2 py-0.5 rounded-full">
                            <Text className="text-white text-xs font-bold">Popular</Text>
                          </View>
                        )}
                        <View>
                          <Text className="text-white font-bold text-lg">
                            🪙 {p.coins.toLocaleString()}
                            {p.bonus ? <Text className="text-emerald-400 text-sm"> {p.bonus}</Text> : null}
                          </Text>
                          <Text className="text-gray-400 text-sm">monedas</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-white font-bold text-xl">{p.price}</Text>
                        {selectedPack === p.id && <Text className="text-yellow-400 text-xs">✓ Seleccionado</Text>}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  onPress={() => selectedPack && setPayStep('card')}
                  disabled={!selectedPack}
                  className={`py-4 rounded-2xl items-center border-2 mt-2 ${
                    selectedPack ? 'bg-red-600 border-red-800' : 'bg-gray-700 border-gray-600'
                  }`}
                >
                  <Text className="text-white font-bold text-lg">
                    {selectedPack ? `Continuar con ${pack?.price}` : 'Selecciona un paquete'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* PASO 2: Formulario de tarjeta */}
            {payStep === 'card' && (
              <View>
                {/* Vista previa tarjeta */}
                <View className="rounded-3xl p-6 mb-5 bg-indigo-900 border border-indigo-700">
                  <View className="flex-row justify-between items-start mb-6">
                    <Text className="text-white/60 text-xs font-bold uppercase">
                      {brand.label}
                    </Text>
                    <Text className="text-2xl">{brand.icon}</Text>
                  </View>
                  <Text className="text-white text-lg font-mono tracking-widest mb-4">
                    {card.number || '•••• •••• •••• ••••'}
                  </Text>
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-white/40 text-xs">TITULAR</Text>
                      <Text className="text-white font-semibold uppercase">{card.name || 'NOMBRE APELLIDO'}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-white/40 text-xs">VENCE</Text>
                      <Text className="text-white font-semibold">{card.expiry || 'MM/AA'}</Text>
                    </View>
                  </View>
                </View>

                {/* Resumen del paquete */}
                <View className="bg-yellow-500/10 border border-yellow-500 rounded-2xl p-4 mb-5">
                  <Text className="text-yellow-400 font-bold text-center">
                    🪙 {pack?.coins.toLocaleString()} monedas por {pack?.price}
                    {pack?.bonus ? ` (${pack.bonus} bonus)` : ''}
                  </Text>
                </View>

                {/* Campos */}
                <Text className="text-gray-400 font-semibold mb-2 text-sm">Número de Tarjeta</Text>
                <View className="bg-gray-900 border border-white/20 rounded-2xl px-4 py-3 mb-1 flex-row items-center">
                  <TextInput
                    value={card.number}
                    onChangeText={t => setCard(p => ({ ...p, number: formatCardNumber(t) }))}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor="#6b7280"
                    keyboardType="number-pad"
                    maxLength={19}
                    className="flex-1 text-white font-mono"
                  />
                  <Text className="text-xl">{brand.icon}</Text>
                </View>
                {cardErrors.number && <Text className="text-red-400 text-xs mb-3">⚠️ {cardErrors.number}</Text>}

                <Text className="text-gray-400 font-semibold mb-2 text-sm mt-3">Nombre del Titular</Text>
                <TextInput
                  value={card.name}
                  onChangeText={t => setCard(p => ({ ...p, name: t.toUpperCase() }))}
                  placeholder="NOMBRE COMO EN LA TARJETA"
                  placeholderTextColor="#6b7280"
                  autoCapitalize="characters"
                  className="bg-gray-900 border border-white/20 rounded-2xl px-4 py-3 text-white mb-1"
                />
                {cardErrors.name && <Text className="text-red-400 text-xs mb-3">⚠️ {cardErrors.name}</Text>}

                <View className="flex-row gap-3 mt-3">
                  <View className="flex-1">
                    <Text className="text-gray-400 font-semibold mb-2 text-sm">Vencimiento</Text>
                    <TextInput
                      value={card.expiry}
                      onChangeText={t => setCard(p => ({ ...p, expiry: formatExpiry(t) }))}
                      placeholder="MM/AA"
                      placeholderTextColor="#6b7280"
                      keyboardType="number-pad"
                      maxLength={5}
                      className="bg-gray-900 border border-white/20 rounded-2xl px-4 py-3 text-white font-mono text-center"
                    />
                    {cardErrors.expiry && <Text className="text-red-400 text-xs mt-1">⚠️ {cardErrors.expiry}</Text>}
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 font-semibold mb-2 text-sm">CVV</Text>
                    <TextInput
                      value={card.cvv}
                      onChangeText={t => setCard(p => ({ ...p, cvv: t.replace(/\D/g, '').slice(0, 4) }))}
                      placeholder="•••"
                      placeholderTextColor="#6b7280"
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={4}
                      className="bg-gray-900 border border-white/20 rounded-2xl px-4 py-3 text-white font-mono text-center"
                    />
                    {cardErrors.cvv && <Text className="text-red-400 text-xs mt-1">⚠️ {cardErrors.cvv}</Text>}
                  </View>
                </View>

                <View className="bg-white/5 rounded-2xl p-3 mt-4 mb-5 flex-row items-center gap-3 border border-white/20">
                  <Text className="text-2xl">🔒</Text>
                  <Text className="text-gray-400 text-xs flex-1">Conexión cifrada SSL. No almacenamos tu información.</Text>
                </View>

                <View className="flex-row gap-3 mb-6">
                  <TouchableOpacity onPress={() => setPayStep('select')} className="flex-1 bg-white/5 py-4 rounded-2xl items-center border border-white/20">
                    <Text className="text-white font-bold">← Volver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handlePay} className="flex-1 bg-red-600 py-4 rounded-2xl items-center border border-red-800">
                    <Text className="text-white font-bold">🔐 Pagar {pack?.price}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* PASO 3: Procesando */}
            {payStep === 'processing' && (
              <View className="items-center py-16">
                <Text className="text-6xl mb-6">⏳</Text>
                <Text className="text-white font-bold text-xl mb-2">Procesando pago…</Text>
                <Text className="text-gray-400 text-sm text-center">Conectando con el servidor seguro</Text>
                <View className="w-48 bg-white/10 rounded-full h-2 mt-8 overflow-hidden">
                  <View className="bg-red-500 h-2 rounded-full w-4/5" />
                </View>
                <Text className="text-gray-600 text-xs mt-3">🔒 SSL/TLS 256-bit</Text>
              </View>
            )}

            {/* PASO 4: Éxito */}
            {payStep === 'done' && (
              <View className="items-center py-10">
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <View className="bg-emerald-500 rounded-full w-28 h-28 items-center justify-center shadow-2xl mb-6">
                    <Text className="text-6xl">✅</Text>
                  </View>
                </Animated.View>
                <Text className="text-white text-2xl font-bold mb-2">¡Recarga exitosa!</Text>
                <Text className="text-gray-400 text-base text-center mb-8">
                  Se acreditaron 🪙 {pack?.coins.toLocaleString()} monedas a tu cuenta.
                </Text>
                <View className="bg-gray-900 rounded-2xl p-4 w-full border border-white/20 mb-6">
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-400">Paquete</Text>
                    <Text className="text-white font-semibold">🪙 {pack?.coins.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-400">Total pagado</Text>
                    <Text className="text-white font-semibold">{pack?.price}</Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-400">Saldo actual</Text>
                    <Text className="text-yellow-400 font-bold">🪙 {inventory.coins}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={resetPay} className="bg-red-600 py-4 rounded-2xl items-center w-full border border-red-800 mb-3">
                  <Text className="text-white font-bold">🛒 Seguir comprando</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(app)/map')} className="bg-white/5 py-4 rounded-2xl items-center w-full border border-white/20">
                  <Text className="text-white font-bold">🗺️ Ir al Mapa</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View className="h-24" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}