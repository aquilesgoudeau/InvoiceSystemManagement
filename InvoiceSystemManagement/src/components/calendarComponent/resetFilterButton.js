import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { RotateCcw } from 'lucide-react-native';

// Clears the filter back to "all dates".
export const ResetFilterButton = ({ isFiltered, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`flex-row items-center justify-center px-3.5 py-3 rounded-2xl border shadow-sm ${
      isFiltered ? 'bg-blue-50 border-blue-200' : 'bg-blue-50 border-blue-200'
    }`}
  >
    <RotateCcw size={18} color={isFiltered ? '#2563eb' : '#2563eb'} />
    <Text className={`ml-1.5 font-bold text-xs ${isFiltered ? 'text-blue-600' :'text-blue-700'}`}>
      Reset
    </Text>
  </TouchableOpacity>
);
