/**
 * 🖊️ CustomInput.tsx — Molécula
 * Tema oscuro consistente con el resto de la app.
 */

import { Text, TextInput, TextInputProps, View } from 'react-native';

interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}

export default function CustomInput({
  label,
  error,
  value,
  onChangeText,
  secureTextEntry = false,
  placeholder,
  ...props
}: CustomInputProps) {
  return (
    <View className="mb-4">
      {/* Label */}
      <Text className="text-gray-400 font-semibold text-sm mb-2 ml-1">
        {label}
      </Text>

      {/* Input oscuro */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#4b5563"
        secureTextEntry={secureTextEntry}
        style={{
          backgroundColor: 'rgba(255,255,255,0.07)',
          borderWidth: 1,
          borderColor: error ? '#ef4444' : 'rgba(255,255,255,0.12)',
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          color: 'white',
          fontSize: 15,
          fontWeight: '500',
        }}
        {...props}
      />

      {/* Error */}
      {error && (
        <View
          className="mt-2 px-3 py-2 rounded-xl"
          style={{ backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: '#ef4444' }}
        >
          <Text className="text-red-400 text-xs font-semibold">⚠️ {error}</Text>
        </View>
      )}
    </View>
  );
}