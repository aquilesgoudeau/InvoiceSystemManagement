import { useState } from 'react';

const RANGE_COLOR = '#2563eb';
const RANGE_BG_COLOR = '#dbeafe';
const RANGE_TEXT_COLOR = '#1e40af';

// Encapsulates the "pick a start day, then an end day" logic and the
// derived `markedDates` object that react-native-calendars expects.
export const useDateRangeSelection = () => {
  const [selectedRange, setSelectedRange] = useState({ start: '', end: '' });

  const resetSelection = () => setSelectedRange({ start: '', end: '' });

  const initSelectionFrom = (dateRange) => {
    if (dateRange.startDate && dateRange.endDate) {
      setSelectedRange({
        start: dateRange.startDate.toISOString().split('T')[0],
        end: dateRange.endDate.toISOString().split('T')[0],
      });
    } else {
      resetSelection();
    }
  };

  const handleDayPress = (day) => {
    const { dateString } = day;
    const { start, end } = selectedRange;

    const startingNewSelection = !start || (start && end);
    if (startingNewSelection) {
      setSelectedRange({ start: dateString, end: '' });
      return;
    }

    const pickedBeforeStart = new Date(dateString) < new Date(start);
    if (pickedBeforeStart) {
      setSelectedRange({ start: dateString, end: '' });
    } else {
      setSelectedRange({ ...selectedRange, end: dateString });
    }
  };

  const getMarkedDates = () => {
    const { start, end } = selectedRange;
    const marked = {};
    if (!start) return marked;

    marked[start] = { startingDay: true, color: RANGE_COLOR, textColor: 'white' };
    if (!end) return marked;

    marked[end] = { endingDay: true, color: RANGE_COLOR, textColor: 'white' };

    let current = new Date(start);
    const endDate = new Date(end);
    current.setDate(current.getDate() + 1);

    while (current < endDate) {
      const dateStr = current.toISOString().split('T')[0];
      marked[dateStr] = { color: RANGE_BG_COLOR, textColor: RANGE_TEXT_COLOR };
      current.setDate(current.getDate() + 1);
    }

    return marked;
  };

  return {
    selectedRange,
    setSelectedRange,
    resetSelection,
    initSelectionFrom,
    handleDayPress,
    getMarkedDates,
  };
};