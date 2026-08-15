
import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useScanner } from '../hooks/useScanner';

const ScannerScreen = () => {
  const navigation = useNavigation();
  const { startScan, loading } = useScanner();
  const scanTriggered = useRef(false);

  const triggerScanOnce = () => {
    if (scanTriggered.current) return;
    scanTriggered.current = true;
    startScan();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', (e) => {
   if (e.data?.closing) return;
      triggerScanOnce();
    });

    return unsubscribe;
  }, [navigation]);

return (
    <View className="flex-1 items-center justify-center px-6">
   
      {loading ? (
        <View className="items-center mt-6">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <View className="items-center mt-6">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}
    </View>
  );
};

export default ScannerScreen;
