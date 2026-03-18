import CustomInput from '@/components/molecules/CustomInput';
import { LoginFormData, LoginSchema } from '@/lib/core/schemas/authSchemas';
import { saveSession } from '@/lib/modules/auth/auth.service';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [formData, setFormData]         = useState<LoginFormData>({ email: '', password: '' });
  const [errors, setErrors]             = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});
      LoginSchema.parse(formData);
      const name = formData.email.split('@')[0];
      await saveSession(formData.email, name);
      router.replace('/(app)/pokedex');
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Partial<Record<keyof LoginFormData, string>> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0] as keyof LoginFormData] = err.message;
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
      className="flex-1 bg-gray-950"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-12">

          {/* Logo + título */}
          <View className="items-center mb-10">
            <View
              className="rounded-3xl mb-5 overflow-hidden"
              style={{ width: 100, height: 100, backgroundColor: '#1a0000' }}
            >
              <Image
                source={require('../../assets/images/icon.png')}
                style={{ width: 100, height: 100 }}
                resizeMode="cover"
              />
            </View>
            <Text className="text-4xl font-bold text-white mb-1">PokédexE2</Text>
            <Text className="text-gray-400 text-base">Captura, colecciona y conquista</Text>
          </View>

          {/* Formulario glassmorphism oscuro */}
          <View
            className="rounded-3xl p-6 border border-white/10"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <Text className="text-white font-bold text-xl mb-5">Iniciar Sesión</Text>

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
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChangeText={t => updateField('password', t)}
              error={errors.password}
              secureTextEntry
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`mt-4 py-4 rounded-2xl items-center border ${
                isSubmitting
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-red-600 border-red-800'
              }`}
            >
              <Text className="text-white font-bold text-base">
                {isSubmitting ? '⏳ Iniciando...' : '🚀 Iniciar Sesión'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-5">
              <Text className="text-gray-400 text-sm mr-2">¿No tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/registro')}>
                <Text className="text-red-400 font-bold text-sm">Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Decoración inferior */}
          <Text className="text-gray-700 text-xs text-center mt-8">
            Usa cualquier email válido y contraseña de 6+ caracteres
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}