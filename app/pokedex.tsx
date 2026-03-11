import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LoadingSpinner from '../components/atoms/LoadingSpinner';
import StatBar from '../components/atoms/StatBar';
import TypeBadge from '../components/atoms/TypeBadge';
import PokemonQR from '../components/molecules/PokemonQR';
import { usePokemon } from '../lib/modules/pokemon/hooks/usePokemon';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PokedexScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { pokemon, loading, error, setPokemonId } = usePokemon(25);
  const [searchInput, setSearchInput] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [iaVisible, setIaVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [iaLoading, setIaLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  // ── FIX: useFocusEffect lee params CADA VEZ que la pantalla recibe foco
  // Esto resuelve el caso donde el pokédex ya estaba montado en el stack
  // y router.push desde el mapa no remonta el componente
  useFocusEffect(
    useCallback(() => {
      const id = params.pokemonId;
      if (id) {
        setPokemonId(Number(id));
      }
    }, [params.pokemonId])
  );

  const toggleIA = () => {
    if (iaVisible) {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH, duration: 350,
        useNativeDriver: true, easing: Easing.out(Easing.cubic),
      }).start(() => setIaVisible(false));
    } else {
      setIaVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0, duration: 350,
        useNativeDriver: true, easing: Easing.out(Easing.cubic),
      }).start();
    }
  };

  const enviarMensaje = async () => {
    if (!API_KEY) {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ No hay API Key configurada.' }]);
      return;
    }
    if (!currentMessage.trim()) return;

    const pregunta = currentMessage.trim();
    setMessages(prev => [...prev, { role: 'user', text: pregunta }]);
    setCurrentMessage('');
    setIaLoading(true);

    try {
      const contexto = pokemon
        ? `Contexto: El usuario está viendo a ${pokemon.name} (${pokemon.types.map(t => t.type.name).join(', ')}). `
        : '';

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${contexto}Eres un experto en Pokémon. Responde de forma breve y amigable en español.\n\nPregunta: ${pregunta}` }] }],
          }),
        }
      );
      const data = await res.json();
      const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text || '❌ No se pudo obtener respuesta.';
      setMessages(prev => [...prev, { role: 'ai', text: texto }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Error al conectar con la IA.' }]);
    } finally {
      setIaLoading(false);
    }
  };

  const handleSearch = () => {
    const v = searchInput.toLowerCase().trim();
    if (v) { setPokemonId(v); setSearchInput(''); }
  };
  const handlePrevious = () => { if (pokemon && pokemon.id > 1) setPokemonId(pokemon.id - 1); };
  const handleNext     = () => { if (pokemon && pokemon.id < 1000) setPokemonId(pokemon.id + 1); };
  const handleRandom   = () => setPokemonId(Math.floor(Math.random() * 898) + 1);
  const toggleFavorite = () => {
    if (!pokemon) return;
    setFavorites(prev =>
      prev.includes(pokemon.id) ? prev.filter(id => id !== pokemon.id) : [...prev, pokemon.id]
    );
  };
  const isFavorite = pokemon && favorites.includes(pokemon.id);

  return (
    <View style={{ flex: 1, backgroundColor: '#CC0000' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 32, maxWidth: 520, alignSelf: 'center', width: '100%' }}>

          {/* ── HEADER ── */}
          <View style={{
            backgroundColor: '#B00000',
            borderRadius: 24,
            padding: 20,
            marginTop: 52,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
            {/* Pokédex decorative dots */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
              <View style={{ width: 48, height: 48, backgroundColor: '#3B9EDB', borderRadius: 24, borderWidth: 3, borderColor: '#1E6FA6', shadowColor: '#3B9EDB', shadowOpacity: 0.5, shadowRadius: 6, elevation: 4 }} />
              <View style={{ width: 12, height: 12, backgroundColor: '#FF6B6B', borderRadius: 6, borderWidth: 2, borderColor: '#CC4444' }} />
              <View style={{ width: 12, height: 12, backgroundColor: '#FFD93D', borderRadius: 6, borderWidth: 2, borderColor: '#CCA800' }} />
              <View style={{ width: 12, height: 12, backgroundColor: '#6BCB77', borderRadius: 6, borderWidth: 2, borderColor: '#3A8A44' }} />
            </View>

            {/* Title row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 26, fontWeight: '900', color: 'white', letterSpacing: 2 }}>POKÉDEX</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <HeaderButton onPress={() => router.push('/qr-scanner')} color="#16A34A" label="📷" />
                <HeaderButton onPress={() => router.push('/pokemon-map')} color="#2563EB" label="🗺️" />
                <HeaderButton onPress={() => router.push('/checkout')} color="#D97706" label="🛒" />
                <HeaderButton onPress={toggleIA} color="#7C3AED" label="🤖" />
                <View style={{ backgroundColor: '#DB2777', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 14 }}>❤️</Text>
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>{favorites.length}</Text>
                </View>
              </View>
            </View>

            {/* Search */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                value={searchInput}
                onChangeText={setSearchInput}
                onSubmitEditing={handleSearch}
                placeholder="Buscar por nombre o #ID"
                placeholderTextColor="#9CA3AF"
                style={{
                  flex: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: 'white',
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: '600',
                  color: '#111',
                }}
              />
              <TouchableOpacity
                onPress={handleSearch}
                style={{ backgroundColor: '#2563EB', paddingHorizontal: 18, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 18 }}>🔍</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── PANTALLA PRINCIPAL ── */}
          <View style={{
            backgroundColor: '#1F1F1F',
            borderRadius: 24,
            padding: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 10,
          }}>
            <View style={{
              backgroundColor: '#C8F5C8',
              borderRadius: 20,
              padding: 16,
              minHeight: 400,
            }}>
              {loading && <LoadingSpinner />}

              {error && (
                <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                  <Text style={{ color: '#B91C1C', fontWeight: '700', fontSize: 16, marginBottom: 16 }}>⚠️ {error}</Text>
                  <TouchableOpacity onPress={handleRandom} style={{ backgroundColor: '#CC0000', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 }}>
                    <Text style={{ color: 'white', fontWeight: '700' }}>🎲 Pokémon Aleatorio</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!loading && !error && pokemon && (
                <View>
                  {/* Imagen */}
                  <View style={{
                    backgroundColor: 'white',
                    borderRadius: 20,
                    padding: 20,
                    marginBottom: 12,
                    alignItems: 'center',
                    position: 'relative',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                  }}>
                    <TouchableOpacity
                      onPress={toggleFavorite}
                      style={{
                        position: 'absolute', top: 12, right: 12,
                        backgroundColor: isFavorite ? '#FEE2E2' : '#F9FAFB',
                        borderRadius: 20, padding: 8, zIndex: 10,
                        borderWidth: 1.5, borderColor: isFavorite ? '#FCA5A5' : '#E5E7EB',
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{isFavorite ? '❤️' : '🤍'}</Text>
                    </TouchableOpacity>
                    <Image
                      source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
                      style={{ width: 220, height: 220 }}
                      resizeMode="contain"
                    />
                  </View>

                  {/* Info básica */}
                  <View style={{
                    backgroundColor: 'white', borderRadius: 20,
                    padding: 16, marginBottom: 12, alignItems: 'center',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
                  }}>
                    <Text style={{ color: '#9CA3AF', fontWeight: '700', fontSize: 13, letterSpacing: 1 }}>
                      #{String(pokemon.id).padStart(3, '0')}
                    </Text>
                    <Text style={{ fontSize: 32, fontWeight: '900', color: '#111827', textTransform: 'capitalize', marginTop: 2, marginBottom: 10 }}>
                      {pokemon.name}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                      {pokemon.types.map(type => (
                        <TypeBadge key={type.type.name} type={type.type.name} />
                      ))}
                    </View>

                    {/* Botones de acción */}
                    <View style={{ width: '100%', flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                      <ActionButton onPress={() => setQrModalVisible(true)} color="#059669" label="📱 Ver QR" />
                      <ActionButton onPress={() => router.push('/checkout')} color="#D97706" label="🛒 Comprar" />
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        toggleIA();
                        setMessages([{ role: 'ai', text: `¡Hola! Puedo responder preguntas sobre ${pokemon.name}. ¿Qué quieres saber?` }]);
                      }}
                      style={{
                        backgroundColor: '#7C3AED', paddingVertical: 11, borderRadius: 14,
                        alignItems: 'center', width: '100%',
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>
                        🤖 Pregunta sobre {pokemon.name}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Stats */}
                  <View style={{
                    backgroundColor: 'white', borderRadius: 20,
                    padding: 16, marginBottom: 12,
                    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E40AF', marginBottom: 12 }}>⚡ Estadísticas</Text>
                    {pokemon.stats.map(stat => (
                      <StatBar key={stat.stat.name} name={stat.stat.name} value={stat.base_stat} />
                    ))}
                  </View>

                  {/* Info adicional */}
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    {[
                      { icon: '⚖️', val: `${(pokemon.weight / 10).toFixed(1)}`, unit: 'KG', bg: '#FEF9C3', border: '#FDE047' },
                      { icon: '📏', val: `${(pokemon.height / 10).toFixed(1)}`, unit: 'M',  bg: '#DCFCE7', border: '#86EFAC' },
                      { icon: '✨', val: `${pokemon.abilities.length}`, unit: 'HAB', bg: '#F3E8FF', border: '#D8B4FE' },
                    ].map(({ icon, val, unit, bg, border }) => (
                      <View key={unit} style={{
                        flex: 1, backgroundColor: bg, borderRadius: 16,
                        padding: 14, alignItems: 'center',
                        borderWidth: 1.5, borderColor: border,
                      }}>
                        <Text style={{ fontSize: 24, marginBottom: 4 }}>{icon}</Text>
                        <Text style={{ fontSize: 20, fontWeight: '800', color: '#111827' }}>{val}</Text>
                        <Text style={{ fontSize: 11, color: '#6B7280', fontWeight: '700', letterSpacing: 0.5 }}>{unit}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Habilidades */}
                  <View style={{
                    backgroundColor: '#FFF7ED', borderRadius: 20,
                    padding: 14, marginBottom: 12,
                    borderWidth: 1.5, borderColor: '#FED7AA',
                  }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#92400E', marginBottom: 8 }}>🎯 Habilidades</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {pokemon.abilities.map(ability => (
                        <View key={ability.ability.name} style={{
                          backgroundColor: '#FED7AA', paddingHorizontal: 14, paddingVertical: 6,
                          borderRadius: 20, borderWidth: 1, borderColor: '#FDBA74',
                        }}>
                          <Text style={{ color: '#92400E', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' }}>
                            {ability.ability.name.replace('-', ' ')}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Navegación */}
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      onPress={handlePrevious} disabled={pokemon.id <= 1}
                      style={{
                        flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center',
                        backgroundColor: pokemon.id <= 1 ? '#E5E7EB' : '#2563EB',
                      }}
                    >
                      <Text style={{ fontWeight: '700', color: pokemon.id <= 1 ? '#9CA3AF' : 'white' }}>← Anterior</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleRandom} style={{
                      flex: 1, backgroundColor: '#16A34A', paddingVertical: 14, borderRadius: 16, alignItems: 'center',
                    }}>
                      <Text style={{ color: 'white', fontWeight: '700' }}>🎲 Aleatorio</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleNext} disabled={pokemon.id >= 1000}
                      style={{
                        flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center',
                        backgroundColor: pokemon.id >= 1000 ? '#E5E7EB' : '#2563EB',
                      }}
                    >
                      <Text style={{ fontWeight: '700', color: pokemon.id >= 1000 ? '#9CA3AF' : 'white' }}>Siguiente →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
              {favorites.length} Pokémon favoritos · Pokédex v2
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── MODAL QR ── */}
      <Modal visible={qrModalVisible} transparent animationType="fade" onRequestClose={() => setQrModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <View style={{
            backgroundColor: '#111827', borderRadius: 28, padding: 24,
            width: '100%', alignItems: 'center',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>QR de {pokemon?.name}</Text>
              <TouchableOpacity
                onPress={() => setQrModalVisible(false)}
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {pokemon && <PokemonQR pokemonId={pokemon.id} pokemonName={pokemon.name} size={200} />}

            <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 16, textAlign: 'center', lineHeight: 18 }}>
              Escanea este código con la app para{'\n'}cargar directamente este Pokémon
            </Text>

            <TouchableOpacity
              onPress={() => { setQrModalVisible(false); router.push('/qr-scanner'); }}
              style={{
                backgroundColor: '#059669', marginTop: 16, paddingVertical: 12,
                borderRadius: 16, width: '100%', alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>📷 Abrir Escáner</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── PANEL IA ── */}
      {iaVisible && (
        <Animated.View
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: SCREEN_WIDTH * 0.78,
            transform: [{ translateX: slideAnim }],
            backgroundColor: '#FAFAFA',
            shadowColor: '#000', shadowOffset: { width: -4, height: 0 },
            shadowOpacity: 0.25, shadowRadius: 16, elevation: 20,
            borderTopLeftRadius: 24, borderBottomLeftRadius: 24,
          }}
        >
          {/* Header IA */}
          <View style={{
            backgroundColor: '#4C1D95', padding: 16, paddingTop: 52,
            borderTopLeftRadius: 24, flexDirection: 'row',
            justifyContent: 'space-between', alignItems: 'center',
          }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '800' }}>🤖 Asistente IA</Text>
            <TouchableOpacity
              onPress={toggleIA}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 18, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Mensajes */}
          <ScrollView style={{ flex: 1, padding: 12 }} showsVerticalScrollIndicator={false}>
            {messages.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>🤖</Text>
                <Text style={{ color: '#6B7280', textAlign: 'center', fontWeight: '600' }}>¡Hola! Pregunta sobre Pokémon</Text>
              </View>
            )}
            {messages.map((msg, i) => (
              <View key={i} style={{
                marginVertical: 4,
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
              }}>
                <View style={{
                  backgroundColor: msg.role === 'user' ? '#7C3AED' : '#F3F4F6',
                  paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18,
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 18,
                  borderBottomLeftRadius: msg.role === 'user' ? 18 : 4,
                }}>
                  <Text style={{ color: msg.role === 'user' ? 'white' : '#111827', fontSize: 13, lineHeight: 19 }}>
                    {msg.text}
                  </Text>
                </View>
              </View>
            ))}
            {iaLoading && (
              <View style={{ alignSelf: 'flex-start', backgroundColor: '#F3F4F6', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, marginVertical: 4 }}>
                <ActivityIndicator size="small" color="#7C3AED" />
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={{
            padding: 12, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#E5E7EB',
            flexDirection: 'row', gap: 8,
          }}>
            <TextInput
              value={currentMessage}
              onChangeText={setCurrentMessage}
              onSubmitEditing={enviarMensaje}
              placeholder="Pregunta algo..."
              placeholderTextColor="#9CA3AF"
              style={{
                flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20,
                paddingHorizontal: 16, paddingVertical: 10, fontSize: 13,
                color: '#111', borderWidth: 1, borderColor: '#E5E7EB',
              }}
            />
            <TouchableOpacity
              onPress={enviarMensaje}
              disabled={!currentMessage.trim() || iaLoading}
              style={{
                width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
                backgroundColor: !currentMessage.trim() || iaLoading ? '#D1D5DB' : '#7C3AED',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>{iaLoading ? '⏳' : '➤'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// ── Componentes pequeños auxiliares ──────────────────────────────────────────

function HeaderButton({ onPress, color, label }: { onPress: () => void; color: string; label: string }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: color, borderRadius: 12,
        paddingHorizontal: 12, paddingVertical: 8,
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 16 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function ActionButton({ onPress, color, label }: { onPress: () => void; color: string; label: string }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1, backgroundColor: color, paddingVertical: 11,
        borderRadius: 14, alignItems: 'center',
      }}
    >
      <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>{label}</Text>
    </TouchableOpacity>
  );
}