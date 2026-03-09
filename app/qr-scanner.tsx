import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Linking,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const FRAME_SIZE = width * 0.72;

type ScanResult = {
  type: string;
  data: string;
};

export default function QRScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [torch, setTorch] = useState(false);

  // Animación de la línea de escaneo
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME_SIZE - 4],
  });

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    Vibration.vibrate(120);
    setResult({ type, data });
  };

  const handleAction = () => {
    if (!result) return;
    const data = result.data;

    // Si es una URL, abrirla
    if (data.startsWith('http://') || data.startsWith('https://')) {
      Linking.openURL(data);
      return;
    }

    // Si parece un ID de Pokémon (pokemon:25 o solo número)
    if (data.startsWith('pokemon:')) {
      const id = data.replace('pokemon:', '');
      router.push({ pathname: '/pokedex', params: { pokemonId: id } });
      return;
    }

    // Ir a checkout con el dato
    router.push({ pathname: '/checkout', params: { scannedData: data } });
  };

  const resetScan = () => {
    setScanned(false);
    setResult(null);
  };

  if (!permission) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <Text className="text-white text-lg">Cargando permisos...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center px-8">
        <Text className="text-white text-5xl mb-6">📷</Text>
        <Text className="text-white text-2xl font-bold text-center mb-3">
          Permiso de Cámara
        </Text>
        <Text className="text-gray-400 text-base text-center mb-8">
          Necesitamos acceso a tu cámara para escanear códigos QR y de barras.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-emerald-500 px-8 py-4 rounded-2xl border-2 border-emerald-700"
        >
          <Text className="text-white font-bold text-lg">Dar Permiso</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-gray-400 text-base">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Cámara */}
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        enableTorch={torch}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            'qr', 'ean13', 'ean8', 'upc_a', 'upc_e',
            'code39', 'code93', 'code128', 'itf14',
            'pdf417', 'aztec', 'datamatrix',
          ],
        }}
      >
        {/* Overlay oscuro */}
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }}>

          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white/15 rounded-full w-11 h-11 items-center justify-center"
            >
              <Text className="text-white text-xl">←</Text>
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold">Escáner Universal</Text>
            <TouchableOpacity
              onPress={() => setTorch(!torch)}
              className={`rounded-full w-11 h-11 items-center justify-center ${
                torch ? 'bg-yellow-400' : 'bg-white/15'
              }`}
            >
              <Text className="text-xl">🔦</Text>
            </TouchableOpacity>
          </View>

          {/* Marco central */}
          <View className="flex-1 items-center justify-center">
            <View
              style={{ width: FRAME_SIZE, height: FRAME_SIZE }}
              className="relative"
            >
              {/* Esquinas del marco */}
              {[
                { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
                { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
                { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
                { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
              ].map((corner, i) => (
                <View
                  key={i}
                  style={[
                    {
                      position: 'absolute',
                      width: 36,
                      height: 36,
                      borderColor: scanned ? '#10b981' : '#fff',
                    },
                    corner,
                  ]}
                />
              ))}

              {/* Línea de escaneo animada */}
              {!scanned && (
                <Animated.View
                  style={{
                    position: 'absolute',
                    left: 4,
                    right: 4,
                    height: 2,
                    backgroundColor: '#10b981',
                    shadowColor: '#10b981',
                    shadowOpacity: 0.9,
                    shadowRadius: 6,
                    transform: [{ translateY: scanLineTranslate }],
                  }}
                />
              )}

              {/* Ícono de éxito */}
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

          {/* Panel de resultado */}
          {result && (
            <View className="mx-4 mb-8 bg-gray-900/95 rounded-3xl p-5 border border-white/10">
              {/* Badge tipo */}
              <View className="flex-row items-center gap-2 mb-3">
                <View className="bg-emerald-500/20 border border-emerald-500 px-3 py-1 rounded-full">
                  <Text className="text-emerald-400 text-xs font-bold uppercase">
                    {result.type.replace('org.iso.', '').replace('com.google.', '')}
                  </Text>
                </View>
                <Text className="text-gray-400 text-xs">Escaneado</Text>
              </View>

              {/* Dato */}
              <Text
                numberOfLines={3}
                className="text-white text-base font-medium mb-4 leading-relaxed"
              >
                {result.data}
              </Text>

              {/* Acciones */}
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleAction}
                  className="flex-1 bg-emerald-500 py-3 rounded-2xl items-center border border-emerald-700"
                >
                  <Text className="text-white font-bold">
                    {result.data.startsWith('http') ? '🌐 Abrir URL' :
                     result.data.startsWith('pokemon:') ? '🎮 Ver Pokémon' :
                     '💳 Ir a Pago'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={resetScan}
                  className="bg-white/10 px-5 py-3 rounded-2xl items-center border border-white/10"
                >
                  <Text className="text-white font-bold">🔄</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Tipos soportados */}
          {!scanned && (
            <View className="pb-10 px-6">
              <Text className="text-white/40 text-xs text-center">
                QR • EAN-13 • EAN-8 • Code128 • Code39 • UPC • PDF417 • Aztec
              </Text>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
}