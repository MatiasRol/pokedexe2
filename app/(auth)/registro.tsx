import CustomInput from '@/components/molecules/CustomInput';
import { RegistroFormData, RegistroSchema } from '@/lib/core/schemas/authSchemas';
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
      RegistroSchema.parse(formData);
      await saveSession(formData.email, formData.nombre);
      router.replace('/(app)/pokedex');
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
      className="flex-1 bg-gray-950"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-12">

          {/* Logo + título */}
          <View className="items-center mb-8">
            <View
              className="rounded-3xl mb-5 overflow-hidden"
              style={{ width: 80, height: 80, backgroundColor: '#1a0000' }}
            >
              <Image
                source={require('../../assets/images/icon.png')}
                style={{ width: 80, height: 80 }}
                resizeMode="cover"
              />
            </View>
            <Text className="text-3xl font-bold text-white mb-1">Crear Cuenta</Text>
            <Text className="text-gray-400 text-sm">Únete y empieza a capturar</Text>
          </View>

          {/* Formulario glassmorphism oscuro */}
          <View
            className="rounded-3xl p-6 border border-white/10"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
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
              className={`mt-4 py-4 rounded-2xl items-center border ${
                isSubmitting
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-red-600 border-red-800'
              }`}
            >
              <Text className="text-white font-bold text-base">
                {isSubmitting ? '⏳ Registrando...' : '✅ Crear Cuenta'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-5">
              <Text className="text-gray-400 text-sm mr-2">¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="text-red-400 font-bold text-sm">Inicia Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}