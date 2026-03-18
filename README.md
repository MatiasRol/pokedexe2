# 📱 PokédexE2

> Aplicación móvil tipo Pokémon GO desarrollada con **Expo** y **React Native**.  
> Captura Pokémon en el mundo real, gestiona tu inventario y compra en la tienda.

---

## 🎮 Funcionalidades

### 🗺️ Mapa y Captura (Funcionalidad Principal)
- Detecta tu ubicación en tiempo real con GPS
- Usa **OpenStreetMap (Overpass API)** para encontrar lugares reales cercanos (parques, ríos, zonas comerciales)
- Coloca Pokémon salvajes en coordenadas geográficas reales según el tipo de zona
- Toca un Pokémon en el mapa para intentar capturarlo
- Sistema de probabilidad de captura según el tipo de Pokébola
- Los Pokémon capturados desaparecen del mapa en tiempo real

### 🎯 Sistema de Pokébolas
| Pokébola | Probabilidad | Precio |
|---|---|---|
| Pokébola normal | 30% | 🪙 50 |
| Superball | 55% | 🪙 100 |
| Ultra Ball | 80% | 🪙 200 |

### 🛒 Tienda
- **Pokébolas** — comprar en cantidad (x1, x3, x5)
- **Pokémon** — adquirir Pokémon destacados directamente
- **Vender** — vender Pokémon capturados por monedas
- **Recargar monedas** — pasarela de pagos con tarjeta de crédito

### 📱 Pokédex
- Buscar cualquier Pokémon por nombre o número
- Ver estadísticas, tipos, habilidades, peso y altura
- Guardar favoritos (persisten entre sesiones)
- Ver Pokémon capturados en tu equipo
- Chat con IA sobre cada Pokémon (Gemini 2.0 Flash)
- Generar código QR por Pokémon para compartir

### 📷 Escáner QR Universal
- Lee QR, EAN-13, EAN-8, Code128, Code39, UPC, PDF417, Aztec y más
- Historial de los últimos 5 escaneos persistido
- Acciones inteligentes: abre URLs, carga Pokémon o va al checkout
- Linterna integrada

### 🔔 Notificaciones
- 🌟 Pokémon del día — programada cada mañana a las 9:00 AM
- 🗺️ Pokémon cercanos al abrir el mapa
- ❤️ Favorito agregado
- 💳 Pago confirmado
- 📷 Código QR escaneado

### 👤 Perfil
- Información de sesión (nombre, email, fecha)
- Estadísticas del juego: capturados, monedas, favoritos
- Inventario de Pokébolas
- Accesos rápidos a todas las secciones
- Cerrar sesión

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|---|---|
| Framework | Expo SDK + Expo Router |
| UI | React Native + NativeWind (Tailwind) |
| Mapas | React Native Maps + Google Maps SDK |
| Datos geográficos | OpenStreetMap (Overpass API) — gratis |
| Pokémon | PokéAPI (gratis, sin key) |
| IA | Google Gemini 2.0 Flash |
| Cámara/QR | Expo Camera |
| Notificaciones | Expo Notifications |
| Audio | Expo AV + Expo Haptics |
| Persistencia | AsyncStorage |
| Validación | Zod |
| Build | EAS Build |

---

## 📁 Estructura del Proyecto

```
pokedexe2/
├── app/
│   ├── _layout.tsx              # Root layout (notificaciones, listener tap)
│   ├── index.tsx                # Redirect a /pokedex
│   ├── (auth)/                  # Rutas sin sesión
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── registro.tsx
│   └── (app)/                   # Rutas protegidas
│       ├── _layout.tsx          # Tab bar + InventoryProvider
│       ├── pokedex.tsx          # 📱 Pokédex
│       ├── map/index.tsx        # 🗺️ Mapa principal      
│       ├── store/index.tsx      # 🛒 Tienda
│       ├── profile/index.tsx    # 👤 Perfil
│       └── scanner/index.tsx    # 📷 Escáner QR
│
├── components/
│   ├── atoms/                   # LoadingSpinner, StatBar, TypeBadge
│   ├── molecules/               # CaptureModal, QRModal, PokemonQR, CustomInput
│   └── organisms/               # AIChat, IAPanelLateral
│
├── lib/
│   ├── core/
│   │   ├── audio/               # sounds.ts
│   │   ├── constants/           # colors.ts
│   │   ├── schemas/             # authSchemas.ts (Zod)
│   │   ├── storage/             # storage.adapter.ts
│   │   └── types/               # pokemon.types, location.types, game.types
│   └── modules/
│       ├── ai/services/         # gemini.ts
│       ├── auth/                # auth.service.ts
│       ├── game/                # useInventory.ts, InventoryContext.tsx
│       ├── maps/services/       # locationPokemon.ts (OSM)
│       ├── notifications/       # notification.adapter.ts, useNotifications.ts
│       ├── pokemon/             # pokeapi.ts, usePokemon.ts, useFavorites.ts
│       └── scanner/             # useScanHistory.ts
│
├── app.config.js                # Configuración Expo con variables de entorno
├── eas.json                     # Perfiles de build EAS
└── .env                         # Variables de entorno (no subir a git)
```

---

## 🚀 Instalación

### Requisitos previos
- Node.js v18+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Cuenta en [expo.dev](https://expo.dev)
- Dispositivo físico Android (recomendado para cámara y mapas)

### 1. Clonar e instalar

```bash
git clone https://github.com/MatiasRol/pokedexe2.git
cd pokedexe2
npm install
```

### 2. Variables de entorno

Crea un archivo `.env` en la raíz:

```env
EXPO_PUBLIC_GEMINI_API_KEY=tu_key_de_google_ai_studio
EXPO_PUBLIC_GOOGLE_MAPS_KEY=tu_key_de_google_maps
```

| Variable | Dónde obtenerla |
|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API Key |
| `GOOGLE_MAPS_KEY` | [console.cloud.google.com](https://console.cloud.google.com) → Credenciales |

> Activa **Maps SDK for Android** y **Maps SDK for iOS** en Google Console.

### 3. Correr en desarrollo

```bash
npx expo start --dev-client --tunnel
```

> Requiere un **Development Build** instalado en el dispositivo (ver sección de build).

---

## 📦 Build con EAS

### Development Build (para probar en dispositivo)

```bash
eas build --profile development --platform android
```

### Preview (APK para compartir)

```bash
eas build --profile preview --platform android
```

### Production (AAB para Play Store)

```bash
eas build --profile production --platform android
```

---

## 🔑 APIs Utilizadas

| API | Uso | Key requerida |
|---|---|---|
| [PokéAPI](https://pokeapi.co) | Datos de Pokémon | ❌ Gratis |
| [OpenStreetMap Overpass](https://overpass-api.de) | Lugares geográficos reales | ❌ Gratis |
| [Open-Meteo](https://open-meteo.com) | Clima actual | ❌ Gratis |
| [Google Maps](https://developers.google.com/maps) | Renderizar el mapa | ✅ Requerida |
| [Google Gemini](https://ai.google.dev) | Chat IA sobre Pokémon | ✅ Requerida |

---

## 🏗️ Arquitectura

### Diseño Atómico (componentes)
```
Atoms      → elementos mínimos (StatBar, TypeBadge, LoadingSpinner)
Molecules  → combinaciones (CaptureModal, QRModal, PokemonQR)
Organisms  → secciones completas (AIChat, IAPanelLateral)
```

### Feature-Based (lib)
```
lib/core/     → utilidades compartidas (tipos, constantes, schemas, storage)
lib/modules/  → lógica por dominio (pokemon, maps, auth, game, ai, notifications)
```

### Contexto Global
El inventario (monedas, Pokébolas, Pokémon capturados) se gestiona con `InventoryContext` para que todos los cambios se reflejen en tiempo real en todas las pantallas sin recargar.

---

## 📝 Variables de Entorno

| Variable | Descripción |
|---|---|
| `EXPO_PUBLIC_GEMINI_API_KEY` | Key de Google AI Studio para el chat IA |
| `EXPO_PUBLIC_GOOGLE_MAPS_KEY` | Key de Google Maps para renderizar el mapa |
| `GOOGLE_SERVICES_JSON` | Ruta al google-services.json (EAS Secret) |

---

## 👥 Autores

**Matias Roldan** — [@MatiasRol](https://github.com/MatiasRol)  
**MatCont** — [@MatCont](https://github.com/MatCont)

---

## 📄 Licencia

MIT
