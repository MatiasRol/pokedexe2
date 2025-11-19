import { View, Text, TextInput, TextInputProps } from 'react-native';

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
      <Text className="text-white font-bold text-base mb-2 ml-1">
        {label}
      </Text>

      {/* Input */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secureTextEntry}
        className={`bg-white px-5 py-4 rounded-2xl border-2 font-medium text-base ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />

      {/* Error Message */}
      {error && (
        <View className="mt-2 bg-red-100 px-3 py-2 rounded-xl border border-red-300">
          <Text className="text-red-700 text-sm font-semibold">
            ⚠️ {error}
          </Text>
        </View>
      )}
    </View>
  );
}