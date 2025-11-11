/**
 * 🔐 PANTALLA DE LOGIN
 * =====================
 * 
 * Formulario de inicio de sesión con validación Zod
 * - Email y contraseña
 * - Validación en tiempo real
 * - Manejo de errores específicos
 */

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import CustomInput from '../../components/auth/CustomInput';
import { LoginSchema, LoginFormData } from '../../utils/authSchemas';

export default function LoginScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Actualizar campo del formulario
  const updateField = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      // Validar con Zod
      const validatedData = LoginSchema.parse(formData);

      // Simular login exitoso
      onLoginSuccess(validatedData);
    } catch (error: any) {
      if (error.errors) {
        // Mapear errores de Zod
        const newErrors: Partial<Record<keyof LoginFormData, string>> = {};
        error.errors.forEach((err: any) => {
          const field = err.path[0] as keyof LoginFormData;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función de éxito (simulada)
  const onLoginSuccess = (data: LoginFormData) => {
    Alert.alert(
      '✅ Inicio de Sesión Exitoso',
      `¡Bienvenido de nuevo!`,
      [
        {
          text: 'Continuar',
          onPress: () => router.push('/'),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gradient-to-b from-purple-600 to-indigo-800"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Header */}
          <View className="items-center mb-10">
            <View className="bg-white rounded-full w-28 h-28 items-center justify-center mb-4 shadow-2xl">
              <Text className="text-6xl">🔐</Text>
            </View>
            <Text className="text-5xl font-bold text-white mb-2">
              Bienvenido
            </Text>
            <Text className="text-white text-lg opacity-90">
              Inicia sesión en tu cuenta
            </Text>
          </View>

          {/* Formulario */}
          <View className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border-2 border-white/20 shadow-2xl">
            <CustomInput
              label="Correo Electrónico"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <CustomInput
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              error={errors.password}
              secureTextEntry
            />

            {/* Botón de Login */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`mt-6 py-5 rounded-2xl items-center border-2 shadow-lg ${
                isSubmitting
                  ? 'bg-gray-400 border-gray-500'
                  : 'bg-blue-500 border-blue-700'
              }`}
            >
              <Text className="text-white font-bold text-lg">
                {isSubmitting ? '⏳ Iniciando...' : '🚀 Iniciar Sesión'}
              </Text>
            </TouchableOpacity>

            {/* Link a Registro */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-white text-base mr-2">
                ¿No tienes cuenta?
              </Text>
              <TouchableOpacity onPress={() => router.push('../auth/registro')}>
                <Text className="text-yellow-300 font-bold text-base underline">
                  Regístrate
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}