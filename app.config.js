export default {
  expo: {
    name: "pokedexe2",
    slug: "pokedexe2",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "pokedexe2",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
      },
      infoPlist: {
        NSCameraUsageDescription:
          "Necesitamos acceso a la cámara para escanear códigos QR y de barras.",
        NSLocationWhenInUseUsageDescription:
          "Necesitamos tu ubicación para mostrarte qué Pokémon pueden aparecer cerca de ti.",
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
        },
      },
      permissions: [
        "android.permission.CAMERA",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
      ],
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
      bundler: "metro",
    },
    plugins: [
      "expo-router",
      [
        "expo-camera",
        {
          cameraPermission:
            "Permite a Pokédex usar la cámara para escanear códigos QR y de barras.",
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Permite a Pokédex acceder a tu ubicación para mostrarte Pokémon cercanos.",
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      [
      "expo-web-browser"
      ],
      "expo-secure-store",
      
        ["expo-notifications", {
          "icon": "./assets/images/icon.png",
          "color": "#EF4444"
        }]
      
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};