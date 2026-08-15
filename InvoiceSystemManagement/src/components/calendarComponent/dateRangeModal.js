import React, { useState, useEffect } from 'react';
import { View, Modal, InteractionManager } from 'react-native';
import { RangeModalHeader } from './rangeModalHeader';
import { RangeCalendarBody } from './rangeCalendarBody';
import { RangeModalFooter } from './rangeModalFooter';

export const DateRangeModal = ({
  visible,
  selectedRange,
  markedDates,
  onDayPress,
  onClear,
  onClose,
  onApply,
}) => {
  const [isCalendarReady, setIsCalendarReady] = useState(false);

  useEffect(() => {
    if (!visible) {
      setIsCalendarReady(false);
      return;
    }
    const task = InteractionManager.runAfterInteractions(() => {
      setIsCalendarReady(true);
    });
    return () => task.cancel();
  }, [visible]);

  const handleClose = () => {
    setIsCalendarReady(false);
    onClose();
  };

  const canApply = Boolean(selectedRange.start) && isCalendarReady;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white pt-6">
        <RangeModalHeader onClose={handleClose} onClear={onClear} />

        <View className="flex-1">
          <RangeCalendarBody
            isReady={isCalendarReady}
            markedDates={markedDates}
            onDayPress={onDayPress}
          />
        </View>

        <RangeModalFooter enabled={canApply} onApply={onApply} />
      </View>
    </Modal>
  );
};

