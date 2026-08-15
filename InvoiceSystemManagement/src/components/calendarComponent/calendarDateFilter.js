import React, { useState, useContext } from 'react';
import { View } from 'react-native';
import { Context as DateFilterContext, FILTER_TYPES } from '../../contexts/dateFilterContext';
import { useDateRangeSelection } from './useDateRangeSelection';
import { FilterTriggerButton } from './filterTriggerButton';
import { ResetFilterButton } from './resetFilterButton';
import { DateRangeModal } from './dateRangeModal';

const formatDateLabel = (filterType, dateRange) => {
  if (filterType === FILTER_TYPES.ALL) return 'All Dates';

  if (dateRange.startDate && dateRange.endDate) {
    const startStr = dateRange.startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const endStr = dateRange.endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    return `${startStr} - ${endStr}`;
  }

  return 'Seleccionar fechas';
};

export const CalendarDateFilterButton = () => {
  const { state: dateState, setPredefinedFilter, setCustomRange } = useContext(DateFilterContext);
  const { filterType, dateRange } = dateState;
  const isFiltered = filterType !== FILTER_TYPES.ALL;

  const [modalVisible, setModalVisible] = useState(false);
  const {
    selectedRange,
    setSelectedRange,
    resetSelection,
    initSelectionFrom,
    handleDayPress,
    getMarkedDates,
  } = useDateRangeSelection();

  const handleOpenModal = () => {
    initSelectionFrom(dateRange);
    setModalVisible(true);
  };

  const handleCloseModal = () => setModalVisible(false);

  const handleApply = () => {
    if (selectedRange.start) {
      const end = selectedRange.end || selectedRange.start;
      setCustomRange(selectedRange.start, end);
    }
    handleCloseModal();
  };

  const handleReset = () => setPredefinedFilter(FILTER_TYPES.ALL);

  return (
    <View className="mb-4">
      <View className="flex-row items-center gap-2">
        <FilterTriggerButton
          label={formatDateLabel(filterType, dateRange)}
          isFiltered={isFiltered}
          onPress={handleOpenModal}
        />
        <ResetFilterButton isFiltered={isFiltered} onPress={handleReset} />
      </View>

      <DateRangeModal
        visible={modalVisible}
        selectedRange={selectedRange}
        markedDates={getMarkedDates()}
        onDayPress={handleDayPress}
        onClear={resetSelection}
        onClose={handleCloseModal}
        onApply={handleApply}
      />
    </View>
  );
};

/*
import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Calendar as CalendarIcon, ChevronDown, RotateCcw, X } from 'lucide-react-native';
import { Context as DateFilterContext, FILTER_TYPES } from '../../contexts/dateFilterContext';

export const CalendarDateFilterButton = () => {
  const { state: dateState, setPredefinedFilter, setCustomRange } = useContext(DateFilterContext);
  const { filterType, dateRange } = dateState;

  const [modalVisible, setModalVisible] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false); // <--- Control de montaje real
  const [selectedRange, setSelectedRange] = useState({ start: '', end: '' });

  // 1. Abrir Modal y posponer el montaje del calendario
  const handleOpenModal = () => {
    setShowCalendar(false); // Nos aseguramos de que el calendario NO exista aún en el DOM virtual
    setModalVisible(true);

    if (dateRange.startDate && dateRange.endDate) {
      setSelectedRange({
        start: dateRange.startDate.toISOString().split('T')[0],
        end: dateRange.endDate.toISOString().split('T')[0]
      });
    } else {
      setSelectedRange({ start: '', end: '' });
    }
  };

 
  const handleModalShow = () => {
    setTimeout(() => {
      setShowCalendar(true);
    }, 200);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setShowCalendar(false);
  };

  const formatDateLabel = () => {
    if (filterType === FILTER_TYPES.ALL) return 'Todas las fechas';
    
    if (dateRange.startDate && dateRange.endDate) {
      const startStr = dateRange.startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      const endStr = dateRange.endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      return `${startStr} - ${endStr}`;
    }

    return 'Seleccionar fechas';
  };

  const handleDayPress = (day) => {
    const { dateString } = day;
    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: dateString, end: '' });
    } else if (selectedRange.start && !selectedRange.end) {
      if (new Date(dateString) < new Date(selectedRange.start)) {
        setSelectedRange({ start: dateString, end: '' });
      } else {
        setSelectedRange({ ...selectedRange, end: dateString });
      }
    }
  };

  const getMarkedDates = () => {
    const marked = {};
    if (!selectedRange.start) return marked;

    marked[selectedRange.start] = { startingDay: true, color: '#2563eb', textColor: 'white' };

    if (selectedRange.end) {
      marked[selectedRange.end] = { endingDay: true, color: '#2563eb', textColor: 'white' };

      let current = new Date(selectedRange.start);
      const end = new Date(selectedRange.end);
      current.setDate(current.getDate() + 1);

      while (current < end) {
        const dateStr = current.toISOString().split('T')[0];
        marked[dateStr] = { color: '#dbeafe', textColor: '#1e40af' };
        current.setDate(current.getDate() + 1);
      }
    }

    return marked;
  };

  const handleApply = () => {
    if (selectedRange.start) {
      const end = selectedRange.end || selectedRange.start;
      setCustomRange(selectedRange.start, end);
    }
    handleCloseModal();
  };

  const handleReset = () => {
    setPredefinedFilter(FILTER_TYPES.ALL);
  };

  const isFiltered = filterType !== FILTER_TYPES.ALL;

  return (
    <View className="mb-4">
     
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={handleOpenModal}
          activeOpacity={0.7}
          className="flex-1 flex-row items-center bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-sm"
        >
          <CalendarIcon size={18} color={isFiltered ? '#2563eb' : '#64748b'} />
          <Text className={`flex-1 font-semibold text-sm ml-2.5 ${isFiltered ? 'text-blue-600 font-bold' : 'text-slate-800'}`} numberOfLines={1}>
            {formatDateLabel()}
          </Text>
          <ChevronDown size={16} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleReset}
          activeOpacity={0.7}
          className={`flex-row items-center justify-center px-3.5 py-3 rounded-2xl border shadow-sm ${
            isFiltered 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-white border-slate-200/80'
          }`}
        >
          <RotateCcw size={18} color={isFiltered ? '#2563eb' : '#64748b'} />
          <Text className={`ml-1.5 font-bold text-xs ${isFiltered ? 'text-blue-600' : 'text-slate-500'}`}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>

    
      <Modal 
        visible={modalVisible} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onShow={handleModalShow} // <--- Espera a que termine la animación
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 bg-white pt-6">
          
          <View className="flex-row items-center justify-between px-6 pb-4 border-b border-slate-100">
            <TouchableOpacity onPress={handleCloseModal} className="p-1">
              <X size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-slate-900">Seleccionar rango</Text>
            <TouchableOpacity onPress={() => setSelectedRange({ start: '', end: '' })}>
              <Text className="text-sm font-semibold text-blue-600">Limpiar</Text>
            </TouchableOpacity>
          </View>

         
          <View className="flex-1">
            {!showCalendar ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="text-slate-400 font-medium text-xs mt-3">
                  Cargando calendario...
                </Text>
              </View>
            ) : (
              <Calendar
                onDayPress={handleDayPress}
                markingType={'period'}
                markedDates={getMarkedDates()}
                pastScrollRange={12}
                futureScrollRange={12}
                scrollEnabled={true}
                showScrollIndicator={false}
                theme={{
                  todayTextColor: '#2563eb',
                  textDayFontWeight: '500',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '600',
                }}
              />
            )}
          </View>

         
          <View className="p-6 border-t border-slate-100 bg-white">
            <TouchableOpacity
              onPress={handleApply}
              disabled={!selectedRange.start || !showCalendar}
              className={`w-full py-3.5 rounded-2xl items-center ${
                selectedRange.start && showCalendar ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <Text className="text-white font-bold text-base">Apply Range</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

*/
