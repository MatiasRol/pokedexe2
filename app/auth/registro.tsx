import CustomInput from '@/components/molecules/CustomInput';
import { RegistroFormData, RegistroSchema } from '@/lib/core/schemas/authSchemas';
import { saveSession } from '@/lib/modules/auth/auth.service';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RegistroScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegistroFormData>({
    nombre: '', email: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors]             = useState<Partial<Record<keyof RegistroFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof RegistroFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      // 1. Validar con Zod
      RegistroSchema.parse(formData);

      // 2. Guardar sesión real en AsyncStorage
      await saveSession(formData.email, formData.nombre);

      // 3. Navegar al Pokédex
      router.replace('/pokedex');

    } catch (error: any) {
      if (error.errors) {
        const newErrors: Partial<Record<keyof RegistroFormData, string>> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0] as keyof RegistroFormData] = err.message;
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
            <Text className="text-4xl font-bold text-white mb-2">Crear Cuenta</Text>
            <Text className="text-white text-base opacity-90">Regístrate para comenzar</Text>
          </View>

          {/* Formulario */}
          <View className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border-2 border-white/20 shadow-2xl">
            <CustomInput
              label="Nombre Completo"
              placeholder="Ingresa tu nombre"
              value={formData.nombre}
              onChangeText={t => updateField('nombre', t)}
              error={errors.nombre}
              autoCapitalize="words"
            />
            <CustomInput
              label="Correo Electrónico"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChangeText={t => updateField('email', t)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <CustomInput
              label="Contraseña"
              placeholder="Mínimo 6 caracteres, 1 mayúscula, 1 número"
              value={formData.password}
              onChangeText={t => updateField('password', t)}
              error={errors.password}
              secureTextEntry
            />
            <CustomInput
              label="Confirmar Contraseña"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChangeText={t => updateField('confirmPassword', t)}
              error={errors.confirmPassword}
              secureTextEntry
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`mt-4 py-5 rounded-2xl items-center border-2 shadow-lg ${
                isSubmitting ? 'bg-gray-400 border-gray-500' : 'bg-green-500 border-green-700'
              }`}
            >
              <Text className="text-white font-bold text-lg">
                {isSubmitting ? '⏳ Registrando...' : '✅ Crear Cuenta'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-white text-base mr-2">¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text className="text-yellow-300 font-bold text-base underline">Inicia Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}