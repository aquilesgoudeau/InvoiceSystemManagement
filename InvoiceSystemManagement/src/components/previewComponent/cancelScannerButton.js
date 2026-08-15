import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const CancelScannerButton = ({ onPress }) => {
  return (
    <TouchableOpacity
      className="bg-slate-200 border border-slate-300 px-6 py-3.5 rounded-xl active:bg-slate-300 flex-row items-center justify-center flex-1 mr-2 shadow-sm"
      onPress={onPress}
    >
      <Text className="text-slate-700 font-semibold text-base">Cancel</Text>
    </TouchableOpacity>
  );
};

export default CancelScannerButton;
