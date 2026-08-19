import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { X, Send } from 'lucide-react-native';
import { Context as ExportContext } from '../../contexts/exportContext';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const ExportReportModal = ({ visible, invoices, dateRange, onClose }) => {
  const { state, loadLastEmail, sendReport, resetExportState } = useContext(ExportContext);
  const { sending, error, success, lastEmail } = state;

  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (visible) {
      resetExportState();
      loadLastEmail();
      setLocalError(null);
    }
  }, [visible]);

  useEffect(() => {
    if (lastEmail) setEmail(lastEmail);
  }, [lastEmail]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => onClose(), 1200);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSend = () => {
    if (!EMAIL_REGEX.test(email)) {
      setLocalError('Ingresa un email válido');
      return;
    }
    if (!invoices || invoices.length === 0) {
      setLocalError('No hay facturas para exportar en este período');
      return;
    }
    setLocalError(null);
    sendReport({ invoices, dateRange, email });
  };

  const disabled = sending || success;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full bg-white rounded-2xl p-6 shadow-lg">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-2xl font-bold text-slate-900">Send report</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={22} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <Text className="text-lg text-slate-600 mb-4">
            {invoices?.length || 0} Invoices for the selected period
          </Text>

          <TextInput
            placeholder="Recipient's email address"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!disabled}
            style={{paddingVertical: 12,textAlignVertical: 'center',lineHeight: 20,fontSize:16}}
            className="border border-slate-200 rounded-2xl px-4 mb-2 text-base text-slate-900 bg-slate-50"
          />

          {(localError || error) && (
            <Text className="text-rose-500 text-sm mb-2">{localError || error}</Text>
          )}

          {success && (
            <Text className="text-emerald-600 text-sm mb-2 font-semibold">
              Report sent successfully
            </Text>
          )}

          <TouchableOpacity
            onPress={handleSend}
            disabled={disabled}
            activeOpacity={0.8}
            className="flex-row items-center justify-center rounded-2xl py-3.5 mt-2 shadow-md"
            style={{ backgroundColor: disabled ? '#cbd5e1' : '#1d4ed8' }}
          >
            {sending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Send size={18} color="white" />
                <Text className="text-white font-semibold text-base ml-2">Send</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ExportReportModal;
