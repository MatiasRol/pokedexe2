import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { RegistroFormData, RegistroSchema } from '../../utils/authSchemas';
import CustomInput from '../auth/CustomInput';

export default function RegistroScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegistroFormData>({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegistroFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof RegistroFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});
  
      const validatedData = RegistroSchema.parse(formData);
  
      // ✅ Ir directo sin alert
      router.push('/pokedex');
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Partial<Record<keyof RegistroFormData, string>> = {};
        error.errors.forEach((err: any) => {
          const field = err.path[0] as keyof RegistroFormData;
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
          <View className="items-center mb-8">
            <View className="bg-white rounded-full w-24 h-24 items-center justify-center mb-4 shadow-lg">
              <Text className="text-5xl">🎮</Text>
            </View>
            <Text className="text-4xl font-bold text-white mb-2">
              Crear Cuenta
            </Text>
            <Text className="text-white text-base opacity-90">
              Regístrate para comenzar
            </Text>
          </View>

          {/* Formulario */}
          <View className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border-2 border-white/20 shadow-2xl">
            <CustomInput
              label="Nombre Completo"
              placeholder="Ingresa tu nombre"
              value={formData.nombre}
              onChangeText={(text) => updateField('nombre', text)}
              error={errors.nombre}
              autoCapitalize="words"
            />

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
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              error={errors.password}
              secureTextEntry
            />

            <CustomInput
              label="Confirmar Contraseña"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
              error={errors.confirmPassword}
              secureTextEntry
            />

            {/* Botón de Registro */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`mt-4 py-5 rounded-2xl items-center border-2 shadow-lg ${
                isSubmitting
                  ? 'bg-gray-400 border-gray-500'
                  : 'bg-green-500 border-green-700'
              }`}
            >
              <Text className="text-white font-bold text-lg">
                {isSubmitting ? '⏳ Registrando...' : '✅ Crear Cuenta'}
              </Text>
            </TouchableOpacity>

            {/* Link a Login */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-white text-base mr-2">
                ¿Ya tienes cuenta?
              </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text className="text-yellow-300 font-bold text-base underline">
                  Inicia Sesión
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}