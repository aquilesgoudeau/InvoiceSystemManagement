import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';

export const RangeModalHeader = ({ onClose, onClear }) => (
  <View className="flex-row items-center justify-between px-6 pb-4 border-b border-slate-100">
    <TouchableOpacity onPress={onClose} className="p-1">
      <X size={24} color="#0f172a" />
    </TouchableOpacity>
    <Text className="text-lg font-bold text-slate-900">Select Range</Text>
    <TouchableOpacity onPress={onClear}>
      <Text className="text-sm font-semibold text-blue-600">Clear</Text>
    </TouchableOpacity>
  </View>
);