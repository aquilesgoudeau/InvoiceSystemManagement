import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react-native';

// The pill-shaped button in the main bar that shows the current
// date-label ("Todas las fechas", "3 ago - 9 ago"...) and opens the modal.
export const FilterTriggerButton = ({ label, isFiltered, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="flex-1 flex-row items-center bg-blue-600 px-4 py-3 rounded-2xl border border-slate-200/80 shadow-sm"
  >
    <CalendarIcon size={18} color={isFiltered ? '#2563eb' : '#fcfcfa'} />
    <Text
      className={`flex-1 font-semibold text-white text-sm ml-2.5 ${isFiltered ? 'text-white font-bold' : 'text-slate-800'}`}
      numberOfLines={1}
    >
      {label}
    </Text>
    <ChevronDown size={16} color="#fcfcfa" />
  </TouchableOpacity>
);