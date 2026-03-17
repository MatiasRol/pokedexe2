import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { POKEBALL_CONFIG, PokeballType } from '@/lib/core/types/game.types';
import { useInventory } from '@/lib/modules/game/useInventory';

// Pokémon destacados en tienda (IDs fijos)
const STORE_POKEMON = [
  { id: 133, name: 'Eevee',      price: 300 },
  { id: 147, name: 'Dratini',    price: 500 },
  { id: 175, name: 'Togepi',     price: 400 },
  { id: 246, name: 'Larvitar',   price: 450 },
  { id: 280, name: 'Ralts',      price: 350 },
  { id: 443, name: 'Gible',      price: 600 },
];

type Tab = 'pokeballs' | 'pokemon' | 'sell';

export default function StoreScreen() {
  const router = useRouter();
  const { inventory, captured, buyPokeball, buyPokemon, sellPokemon } = useInventory();
  const [activeTab, setActiveTab] = useState<Tab>('pokeballs');
  const [feedback, setFeedback]   = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleBuyPokeball = (type: PokeballType, qty: number) => {
    const success = buyPokeball(type, qty);
    if (success) {
      showFeedback(`✅ Compraste ${qty} ${POKEBALL_CONFIG[type].label}(s)`);
    } else {
      showFeedback('❌ No tienes suficientes monedas');
    }
  };

  const handleBuyPokemon = async (id: number, name: string, price: number) => {
    const res  = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();
    const success = buyPokemon(data, price);
    if (success) {
      showFeedback(`✅ ¡${name} se unió a tu equipo!`);
    } else {
      showFeedback('❌ No tienes suficientes monedas');
    }
  };

  const handleSell = (uid: string, name: string, price: number) => {
    sellPokemon(uid);
    showFeedback(`💰 Vendiste a ${name} por ${price} monedas`);
  };

  return (
    <View className="flex-1 bg-gray-950">

      {/* ── Header ── */}
      <View className="bg-gray-900 pt-14 pb-4 px-5 border-b border-white/10">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-2xl font-bold">🛒 Tienda</Text>
          <View className="bg-yellow-500/20 border border-yellow-500 px-4 py-2 rounded-2xl">
            <Text className="text-yellow-400 font-bold">🪙 {inventory.coins}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2 mt-4">
          {([
            { key: 'pokeballs', label: 'Pokébolas', emoji: '⚽' },
            { key: 'pokemon',   label: 'Pokémon',   emoji: '🌟' },
            { key: 'sell',      label: 'Vender',    emoji: '💰' },
          ] as { key: Tab; label: string; emoji: string }[]).map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-xl items-center border ${
                activeTab === tab.key
                  ? 'bg-red-600 border-red-800'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <Text className="text-base">{tab.emoji}</Text>
              <Text className={`text-xs font-semibold mt-0.5 ${
                activeTab === tab.key ? 'text-white' : 'text-gray-400'
              }`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Feedback toast */}
      {feedback && (
        <View className="mx-4 mt-3 bg-gray-800 rounded-2xl px-4 py-3 border border-white/10">
          <Text className="text-white text-center font-semibold">{feedback}</Text>
        </View>
      )}

      <ScrollView className="flex-1 px-4 pt-4">

        {/* ── TAB: POKÉBOLAS ── */}
        {activeTab === 'pokeballs' && (
          <View>
            <Text className="text-gray-400 text-sm mb-4">
              Las Pokébolas determinan la probabilidad de captura en el mapa.
            </Text>
            {(Object.keys(POKEBALL_CONFIG) as PokeballType[]).map(type => {
              const cfg = POKEBALL_CONFIG[type];
              return (
                <View key={type} className="bg-gray-900 rounded-3xl p-5 mb-3 border border-white/10">
                  <View className="flex-row items-center mb-3">
                    <Text className="text-4xl mr-4">{cfg.emoji}</Text>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-lg">{cfg.label}</Text>
                      <Text className="text-gray-400 text-sm">
                        {Math.round(cfg.probability * 100)}% prob. de captura
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-yellow-400 font-bold">🪙 {cfg.price}</Text>
                      <Text className="text-gray-500 text-xs">
                        Tienes: {inventory.pokeballs[type]}
                      </Text>
                    </View>
                  </View>

                  {/* Barra de probabilidad */}
                  <View className="w-full bg-white/10 rounded-full h-2 mb-3">
                    <View
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${cfg.probability * 100}%` }}
                    />
                  </View>

                  {/* Botones de compra */}
                  <View className="flex-row gap-2">
                    {[1, 3, 5].map(qty => (
                      <TouchableOpacity
                        key={qty}
                        onPress={() => handleBuyPokeball(type, qty)}
                        className="flex-1 bg-white/5 border border-white/10 py-2 rounded-xl items-center"
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

        {/* ── TAB: COMPRAR POKÉMON ── */}
        {activeTab === 'pokemon' && (
          <View>
            <Text className="text-gray-400 text-sm mb-4">
              Pokémon destacados disponibles para tu equipo.
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {STORE_POKEMON.map(item => (
                <View
                  key={item.id}
                  className="bg-gray-900 rounded-3xl p-4 items-center border border-white/10"
                  style={{ width: '47%' }}
                >
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

        {/* ── TAB: VENDER ── */}
        {activeTab === 'sell' && (
          <View>
            {captured.length === 0 ? (
              <View className="items-center py-16">
                <Text className="text-5xl mb-4">🎒</Text>
                <Text className="text-white font-bold text-lg mb-2">Sin Pokémon para vender</Text>
                <Text className="text-gray-400 text-sm text-center">
                  Captura Pokémon en el mapa para poder venderlos aquí.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(app)/map')}
                  className="mt-6 bg-red-600 px-6 py-3 rounded-2xl border border-red-800"
                >
                  <Text className="text-white font-bold">🗺️ Ir al Mapa</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text className="text-gray-400 text-sm mb-4">
                  {captured.length} Pokémon en tu equipo. Vende los que no necesites.
                </Text>
                {captured.map(entry => (
                  <View
                    key={entry.uid}
                    className="bg-gray-900 rounded-2xl p-4 mb-3 flex-row items-center border border-white/10"
                  >
                    <Image
                      source={{ uri: entry.pokemon.sprites.other['official-artwork'].front_default }}
                      style={{ width: 56, height: 56 }}
                      resizeMode="contain"
                    />
                    <View className="flex-1 ml-3">
                      <Text className="text-white font-bold capitalize">{entry.pokemon.name}</Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <Text className="text-gray-400 text-xs">
                          {POKEBALL_CONFIG[entry.pokeball].emoji} {POKEBALL_CONFIG[entry.pokeball].label}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleSell(entry.uid, entry.pokemon.name, entry.sellPrice)}
                      className="bg-yellow-500/20 border border-yellow-500 px-3 py-2 rounded-xl"
                    >
                      <Text className="text-yellow-400 font-bold text-xs">
                        🪙 {entry.sellPrice}
                      </Text>
                      <Text className="text-yellow-400 text-xs text-center">Vender</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}