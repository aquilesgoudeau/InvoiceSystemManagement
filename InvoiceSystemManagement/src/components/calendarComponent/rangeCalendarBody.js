import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { CalendarList } from 'react-native-calendars';

const CALENDAR_THEME = {
  todayTextColor: '#2563eb',
  textDayFontWeight: '500',
  textMonthFontWeight: 'bold',
  textDayHeaderFontWeight: '600',
};

const MONTH_HEIGHT = 360;

export const RangeCalendarBody = ({ isReady, markedDates, onDayPress }) => {
  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-slate-400 font-medium text-xs mt-3">
          Loading calendar...
        </Text>
      </View>
    );
  }

  return (
    <CalendarList
      onDayPress={onDayPress}
      markingType="period"
      markedDates={markedDates}
      pastScrollRange={12}
      futureScrollRange={2}
      scrollEnabled
      showScrollIndicator={false}
      theme={CALENDAR_THEME}
      calendarHeight={MONTH_HEIGHT}   
      initialNumToRender={1}          
      removeClippedSubviews           
      maxToRenderPerBatch={2}         
      updateCellsBatchingPeriod={50}
      windowSize={5}                  
      pagingEnabled={false}
      showScrollIndicator={false}
    />
  );
};
