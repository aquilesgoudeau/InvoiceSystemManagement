import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

export const RangeModalFooter = ({ enabled, onApply }) => (
  <View className="p-6 border-t border-slate-100 bg-white">
    <TouchableOpacity
      onPress={onApply}
      disabled={!enabled}
      className={`w-full py-3.5 rounded-2xl items-center ${enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
      <Text className="text-white font-bold text-base">Apply Range</Text>
    </TouchableOpacity>
  </View>
);