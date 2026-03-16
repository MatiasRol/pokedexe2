import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { useNotifications } from '@/lib/modules/notifications/useNotifications';
import { useScanHistory }   from '@/lib/modules/scanner/useScanHistory';
 
const { width }  = Dimensions.get('window');
const FRAME_SIZE = width * 0.72;
 
type ScanResult = { type: string; data: string };
 
export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned]           = useState(false);
  const [result, setResult]             = useState<ScanResult | null>(null);
  const [torch, setTorch]               = useState(false);
  const [showHistory, setShowHistory]   = useState(false);
 
  const { notifyQRScanned }                                         = useNotifications();
  const { history, addScan, clearHistory, getTypeLabel, formatDate } = useScanHistory();
 
  const scanLineAnim = useRef(new Animated.Value(0)).current;
 
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
 
  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1], outputRange: [0, FRAME_SIZE - 4],
  });
 
  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    Vibration.vibrate(120);
    addScan(data, type);
    await notifyQRScanned(data);
    setResult({ type, data });
  };
 
  const handleAction = (data: string) => {
    if (data.startsWith('http://') || data.startsWith('https://')) {
      Linking.openURL(data);
      return;
    }
    if (data.startsWith('pokemon:')) {
      router.push({ pathname: '/(app)/pokedex', params: { pokemonId: data.replace('pokemon:', '') } });
      return;
    }
    router.push({ pathname: '/(app)/store', params: { scannedData: data } });
  };
 
  const getContentIcon  = (d: string) => d.startsWith('http') ? '🌐' : d.startsWith('pokemon:') ? '🎮' : '💳';
  const getActionLabel  = (d: string) => d.startsWith('http') ? 'Abrir URL' : d.startsWith('pokemon:') ? 'Ver Pokémon' : 'Ir a Pago';
 
  if (!permission) {
    return <View className="flex-1 bg-gray-900 items-center justify-center"><Text className="text-white">Cargando permisos...</Text></View>;
  }
 
  if (!permission.granted) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center px-8">
        <Text className="text-5xl mb-6">📷</Text>
        <Text className="text-white text-2xl font-bold text-center mb-3">Permiso de Cámara</Text>
        <Text className="text-gray-400 text-base text-center mb-8">
          Necesitamos acceso a tu cámara para escanear códigos QR y de barras.
        </Text>
        <TouchableOpacity onPress={requestPermission} className="bg-emerald-500 px-8 py-4 rounded-2xl border-2 border-emerald-700">
          <Text className="text-white font-bold text-lg">Dar Permiso</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-gray-400">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }
 
  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        enableTorch={torch}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr','ean13','ean8','upc_a','upc_e','code39','code93','code128','itf14','pdf417','aztec','datamatrix'],
        }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }}>
 
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
            <TouchableOpacity onPress={() => router.back()} className="bg-white/15 rounded-full w-11 h-11 items-center justify-center">
              <Text className="text-white text-xl">←</Text>
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold">Escáner Universal</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={() => setShowHistory(!showHistory)} className={`rounded-full w-11 h-11 items-center justify-center ${showHistory ? 'bg-emerald-500' : 'bg-white/15'}`}>
                <Text className="text-lg">📋</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTorch(!torch)} className={`rounded-full w-11 h-11 items-center justify-center ${torch ? 'bg-yellow-400' : 'bg-white/15'}`}>
                <Text className="text-lg">🔦</Text>
              </TouchableOpacity>
            </View>
          </View>
 
          {/* Historial */}
          {showHistory && (
            <View className="mx-4 bg-gray-950/95 rounded-3xl border border-white/10 overflow-hidden">
              <View className="flex-row justify-between items-center px-4 py-3 border-b border-white/10">
                <Text className="text-white font-bold">📋 Últimos escaneos</Text>
                {history.length > 0 && (
                  <TouchableOpacity onPress={clearHistory}>
                    <Text className="text-red-400 text-xs font-semibold">Limpiar</Text>
                  </TouchableOpacity>
                )}
              </View>
              {history.length === 0 ? (
                <View className="py-6 items-center">
                  <Text className="text-gray-500 text-sm">Sin escaneos aún</Text>
                </View>
              ) : (
                <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                  {history.map((entry, i) => (
                    <TouchableOpacity
                      key={entry.id}
                      onPress={() => { setShowHistory(false); handleAction(entry.data); }}
                      className={`flex-row items-center px-4 py-3 gap-3 ${i < history.length - 1 ? 'border-b border-white/5' : ''}`}
                    >
                      <Text className="text-2xl">{getContentIcon(entry.data)}</Text>
                      <View className="flex-1">
                        <Text className="text-white text-sm font-medium" numberOfLines={1}>{entry.data}</Text>
                        <View className="flex-row items-center gap-2 mt-0.5">
                          <View className="bg-white/10 px-2 py-0.5 rounded-full">
                            <Text className="text-gray-400 text-xs">{getTypeLabel(entry.type)}</Text>
                          </View>
                          <Text className="text-gray-600 text-xs">{formatDate(entry.scannedAt)}</Text>
                        </View>
                      </View>
                      <Text className="text-gray-600 text-xs">→</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
 
          {/* Marco */}
          {!showHistory && (
            <View className="flex-1 items-center justify-center">
              <View style={{ width: FRAME_SIZE, height: FRAME_SIZE }} className="relative">
                {[
                  { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
                  { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
                  { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
                  { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
                ].map((corner, i) => (
                  <View key={i} style={[{ position: 'absolute', width: 36, height: 36, borderColor: scanned ? '#10b981' : '#fff' }, corner]} />
                ))}
                {!scanned && (
                  <Animated.View style={{ position: 'absolute', left: 4, right: 4, height: 2, backgroundColor: '#10b981', shadowColor: '#10b981', shadowOpacity: 0.9, shadowRadius: 6, transform: [{ translateY: scanLineTranslate }] }} />
                )}
                {scanned && (
                  <View className="absolute inset-0 items-center justify-center">
                    <Text className="text-7xl">✅</Text>
                  </View>
                )}
              </View>
              <Text className="text-white/70 text-sm mt-6 font-medium">
                {scanned ? 'Código detectado' : 'Apunta al código QR o de barras'}
              </Text>
            </View>
          )}
 
          {/* Resultado */}
          {result && (
            <View className="mx-4 mb-8 bg-gray-900/95 rounded-3xl p-5 border border-white/10">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="bg-emerald-500/20 border border-emerald-500 px-3 py-1 rounded-full">
                  <Text className="text-emerald-400 text-xs font-bold uppercase">{getTypeLabel(result.type)}</Text>
                </View>
                <Text className="text-gray-400 text-xs">Escaneado</Text>
              </View>
              <Text numberOfLines={3} className="text-white text-base font-medium mb-4 leading-relaxed">{result.data}</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => handleAction(result.data)} className="flex-1 bg-emerald-500 py-3 rounded-2xl items-center border border-emerald-700">
                  <Text className="text-white font-bold">{getContentIcon(result.data)} {getActionLabel(result.data)}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setScanned(false); setResult(null); }} className="bg-white/10 px-5 py-3 rounded-2xl items-center border border-white/10">
                  <Text className="text-white font-bold">🔄</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
 
          {!scanned && !showHistory && (
            <View className="pb-10 px-6">
              <Text className="text-white/40 text-xs text-center">QR • EAN-13 • EAN-8 • Code128 • Code39 • UPC • PDF417 • Aztec</Text>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
}