import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

const SubmitScannerButton = ({ onPress}) => {
  return (
    <TouchableOpacity
      className="bg-blue-700 px-6 py-3.5 rounded-xl active:bg-emerald-700 flex-row items-center justify-center flex-1 ml-2 shadow-md"
      onPress={onPress}
    >
        <Text className="text-white font-semibold text-base">Confirm</Text>
    
    </TouchableOpacity>
  );
};

export default SubmitScannerButton;
