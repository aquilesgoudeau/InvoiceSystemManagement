import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from "@react-navigation/native";

const CreateScannerButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      className="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-blue-700 shadow-lg active:bg-blue-700 items-center justify-center z-10"
      onPress={() => navigation.navigate('Scanner')}
    >
      <Text className="text-white text-3xl leading-none">+</Text>
    </TouchableOpacity>
  );
};

export default CreateScannerButton;