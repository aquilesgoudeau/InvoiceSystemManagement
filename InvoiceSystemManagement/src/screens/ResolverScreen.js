import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";

const ResolverScreen = () => {
  const navigation = useNavigation();

  return (
    <View className="flex-1 items-center justify-center bg-slate-100">
      <Text className="text-2xl font-bold text-blue-600 mb-6">ResolverScreen</Text>
      
      <TouchableOpacity 
        className="bg-blue-500 px-6 py-3 rounded-full shadow-md active:bg-blue-700"
        onPress={() => navigation.navigate('AuthFlow')}
      >
        <Text className="text-white font-semibold text-base">Ir a Landing</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResolverScreen;
