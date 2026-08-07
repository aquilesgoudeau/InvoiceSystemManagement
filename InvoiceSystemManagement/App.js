import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-100 px-6">
      <View className="bg-white p-8 rounded-2xl shadow-lg items-center border border-slate-200 w-full max-w-sm">
        <Text className="text-3xl mb-2">🚀</Text>
        <Text className="text-2xl font-bold text-blue-600 text-center mb-2">
          ¡Tailwind Funciona!
        </Text>
        <Text className="text-slate-500 text-center text-base">
          NativeWind v4 se ha enlazado correctamente con tu archivo global.css.
        </Text>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}
