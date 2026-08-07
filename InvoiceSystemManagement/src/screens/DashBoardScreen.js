import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";

const DashBoardScreen = () => {
  const navigation = useNavigation();

  return (
    <View className="flex-1 items-center justify-center bg-slate-100">
      <Text className="text-2xl font-bold text-blue-600 mb-6">DashBoardScreen</Text>
      
      <TouchableOpacity 
        className="bg-blue-500 px-6 py-3 rounded-full shadow-md active:bg-blue-700"
        onPress={() => navigation.navigate('CheckAuth')}
      >
        <Text className="text-white font-semibold text-base">Ir a Resolver</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DashBoardScreen;
