import React, { useContext, useState } from 'react';
import { View, Text, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Context as ScannerContext } from '../contexts/scannerContext';
import CancelScannerButton from '../components/previewComponent/cancelScannerButton';
import SubmitScannerButton from '../components/previewComponent/submitScannerButton';
import { processImageForUpload } from '../utils/imageUtils';

const PreviewScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { state, geminiScan } = useContext(ScannerContext);
  const [status,setStatus] = useState(false)
  const uri = state.scannedUri

  const handleCancel = () => {
    navigation.navigate('Home');
  };

  const handleSubmit = async () => {
      setStatus(true)
      const processedResult = await processImageForUpload(state.scannedUri);
      geminiScan(processedResult);
  }
  return (
    <View className="flex-1">
      <View className="absolute inset-0 w-full h-full justify-center items-center">
        {
          !status?
            <Image
              source={{uri}}
              className="w-full h-full"
              resizeMode="contain"
            />
            :
            <View className="items-center mt-6">
                      <ActivityIndicator size="large" color="#2563eb" />
                      <Text>Processing...</Text>
             </View>
        }
        
      </View>
       {
        !status ?
        <View
          className="absolute bottom-0 left-0 right-0 z-40 px-6 pt-4 border-t border-white/10 flex-row justify-between items-center shadow-lg"
          style={{ paddingBottom: Math.max(insets.bottom, 32) }}
        >
        <CancelScannerButton onPress={handleCancel} />
        <SubmitScannerButton onPress={handleSubmit} />
      </View>
       :
       null

       }
       
    </View>
  );
};

export default PreviewScreen;

/*
import React, { useContext, useState } from 'react';
import { View, Text, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { Context as ScannerContext } from '../contexts/scannerContext';
import CancelScannerButton from '../components/previewComponent/cancelScannerButton';
import SubmitScannerButton from '../components/previewComponent/submitScannerButton';
import { processImageForUpload } from '../utils/imageUtils';

const PreviewScreen = () => {
  const navigation = useNavigation();
  const { state, geminiScan } = useContext(ScannerContext);
  const [status,setStatus] = useState(false)
  const uri = state.scannedUri

  const handleCancel = () => {
    navigation.navigate('Home');
  };

  const handleSubmit = async () => {
      setStatus(true)
      const processedResult = await processImageForUpload(state.scannedUri);
      geminiScan(processedResult);
  }
  return (
    <View className="flex-1">
      <View className="absolute inset-0 w-full h-full justify-center items-center">
        {
          !status?
            <Image
              source={{uri}}
              className="w-full h-full"
              resizeMode="contain"
            />
            :
            <View className="items-center mt-6">
                      <ActivityIndicator size="large" color="#2563eb" />
                      <Text>Processing...</Text>
             </View>
        }
        
      </View>
       {
        !status ?
        <View className="absolute bottom-0 left-0 right-0 z-40 px-6 pt-4 pb-8 border-t border-white/10 flex-row justify-between items-center shadow-lg">
        <CancelScannerButton onPress={handleCancel} />
        <SubmitScannerButton onPress={handleSubmit} />
      </View>
       :
       null

       }
       
    </View>
  );
};

export default PreviewScreen;
*/