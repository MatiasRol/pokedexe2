import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoginFormData, LoginSchema } from '../../utils/authSchemas';
import CustomInput from '../auth/CustomInput';

export default function LoginScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});
  
      const validatedData = LoginSchema.parse(formData);
  
      // ✅ Ir directo sin alert
      router.push('/pokedex');
    } catch (error: any) {
      if (error.errors) {
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-red-600"
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
              <TouchableOpacity onPress={() => router.push('/auth/registro')}>
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