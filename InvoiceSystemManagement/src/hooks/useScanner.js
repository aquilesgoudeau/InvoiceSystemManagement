import { useState, useCallback, useContext } from 'react';
import { Alert } from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { Context as ScannerContext } from '../contexts/scannerContext';

export const useScanner = () => {
  const [loading, setLoading] = useState(false);
  const { handleScanAccept, handleScanCancel } = useContext(ScannerContext);

  const startScan = useCallback(async () => {
    setLoading(true);
    try {
      const { scannedImages } = await DocumentScanner.scanDocument({
        maxNumDocuments: 1,
        croppedImageQuality: 60,
        letUserAdjustCrop: true,
      });

      if (scannedImages && scannedImages.length > 0) {
        console.log('aqui estamos');
        handleScanAccept(scannedImages[0]);
      } else {
        handleScanCancel();
      }
    } catch (error) {
      console.error('Error starting document scanner:', error);
      Alert.alert(
        'Scanner Error',
        'Unable to open document scanner. Please verify camera permissions.'
      );
      handleScanCancel();
    } finally {
      setLoading(false);
    }
  }, [handleScanAccept, handleScanCancel]);

  return { startScan, loading };
};
