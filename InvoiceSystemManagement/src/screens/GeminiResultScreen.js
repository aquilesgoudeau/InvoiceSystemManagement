import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Context as ScannerContext } from '../contexts/scannerContext';
import { formatInvoiceDate } from '../utils/formatDate'

const GeminiResultScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { state, clearScan, acceptInvoice, rejectScan } = useContext(ScannerContext);
  const { result, errorMessage } = state;

  const handleBack = () => {
    clearScan();
    navigation.navigate('Home');
  };

  const handleAccept = () => {
    acceptInvoice(result);
  };

  const handleReject = () => {
    rejectScan();
  };

  if (errorMessage) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-6">
        <Text className="text-rose-600 font-extrabold text-xl mb-2 text-center">
          Reading Error
        </Text>
        <Text className="text-slate-500 text-sm text-center mb-6 px-6">
          {errorMessage}
        </Text>
        <TouchableOpacity
          className="bg-emerald-600 px-8 py-3.5 rounded-full shadow-md active:bg-emerald-700"
          onPress={handleBack}
        >
          <Text className="text-white font-semibold text-base">Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!result) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-6">
        <Text className="text-slate-500 text-sm text-center">
          No results available yet.
        </Text>
      </View>
    );
  }

  const { vendorName, abn, invoiceNumber, invoiceDate, currency, subtotal, tax, total, items } = result;

  return (
    <View className="flex-1 bg-slate-100 px-6 pt-16 pb-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-black text-slate-900 mb-6">
          Invoice Result
        </Text>

        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          {vendorName && (
            <Text className="text-lg font-bold text-slate-900 mb-1">{vendorName}</Text>
          )}
          {abn && (
            <Text className="text-slate-500 text-sm mb-0.5">ABN: {abn}</Text>
          )}
          {invoiceNumber && (
            <Text className="text-slate-500 text-sm mb-0.5">Invoice N° {invoiceNumber}</Text>
          )}
          {invoiceDate && (
            <Text className="text-slate-500 text-sm">{formatInvoiceDate(invoiceDate)}</Text>
          )}
        </View>

        {items && items.length > 0 && (
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <Text className="text-slate-900 font-semibold mb-3">Items</Text>
            {items.map((item, index) => (
              <View
                key={index}
                className="flex-row justify-between items-start py-2 border-b border-slate-100"
              >
                <View className="flex-1 pr-3">
                  <Text className="text-slate-800 text-sm">{item.description}</Text>
                  {item.quantity != null && (
                    <Text className="text-slate-400 text-xs mt-0.5">Quantity: {item.quantity}</Text>
                  )}
                </View>
                <Text className="text-slate-800 text-sm font-semibold">
                  {currency || '$'}{` ${item.amount}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          {subtotal != null && (
            <View className="flex-row justify-between mb-1">
              <Text className="text-slate-500 text-sm">Subtotal</Text>
              <Text className="text-slate-700 text-sm">{currency || '$'}{` ${subtotal}`}</Text>
            </View>
          )}
          {tax != null && (
            <View className="flex-row justify-between mb-1">
              <Text className="text-slate-500 text-sm">Taxes</Text>
              <Text className="text-slate-700 text-sm">{currency || '$'}{` ${tax}`}</Text>
            </View>
          )}
          <View className="flex-row justify-between mt-2 pt-2 border-t border-slate-100">
            <Text className="text-slate-900 font-bold text-base">Total</Text>
            <Text className="text-emerald-600 font-bold text-base">{currency || '$'}{` ${total}`}</Text>
          </View>
        </View>
      </ScrollView>

      <View className="flex-row mt-4" style={{ gap: 12, paddingBottom: Math.max(insets.bottom, 8) }}>
        <TouchableOpacity
          className="flex-1 bg-white border border-rose-500 px-6 py-3.5 rounded-full items-center active:bg-rose-50"
          onPress={handleReject}
        >
          <Text className="text-rose-600 font-semibold text-base">Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-blue-700 px-6 py-3.5 rounded-full shadow-md items-center active:bg-emerald-700"
          onPress={handleAccept}
        >
          <Text className="text-white font-semibold text-base">Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GeminiResultScreen;


/*
import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Context as ScannerContext } from '../contexts/scannerContext';
import { formatInvoiceDate } from '../utils/formatDate'

const GeminiResultScreen = () => {
  const navigation = useNavigation();
  const { state, clearScan, acceptInvoice, rejectScan } = useContext(ScannerContext);
  const { result, errorMessage } = state;

  const handleBack = () => {
    clearScan();
    navigation.navigate('Home');
  };

  const handleAccept = () => {
    acceptInvoice(result);
  };

  const handleReject = () => {
    rejectScan();
  };

  if (errorMessage) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-6">
        <Text className="text-rose-600 font-extrabold text-xl mb-2 text-center">
          Reading Error
        </Text>
        <Text className="text-slate-500 text-sm text-center mb-6 px-6">
          {errorMessage}
        </Text>
        <TouchableOpacity
          className="bg-emerald-600 px-8 py-3.5 rounded-full shadow-md active:bg-emerald-700"
          onPress={handleBack}
        >
          <Text className="text-white font-semibold text-base">Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!result) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-6">
        <Text className="text-slate-500 text-sm text-center">
          No results available yet.
        </Text>
      </View>
    );
  }

  const { vendorName, abn, invoiceNumber, invoiceDate, currency, subtotal, tax, total, items } = result;

  return (
    <View className="flex-1 bg-slate-100 px-6 pt-16 pb-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-black text-slate-900 mb-6">
          Invoice Result
        </Text>

        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          {vendorName && (
            <Text className="text-lg font-bold text-slate-900 mb-1">{vendorName}</Text>
          )}
          {abn && (
            <Text className="text-slate-500 text-sm mb-0.5">ABN: {abn}</Text>
          )}
          {invoiceNumber && (
            <Text className="text-slate-500 text-sm mb-0.5">Invoice N° {invoiceNumber}</Text>
          )}
          {invoiceDate && (
            <Text className="text-slate-500 text-sm">{formatInvoiceDate(invoiceDate)}</Text>
          )}
        </View>

        {items && items.length > 0 && (
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <Text className="text-slate-900 font-semibold mb-3">Items</Text>
            {items.map((item, index) => (
              <View
                key={index}
                className="flex-row justify-between items-start py-2 border-b border-slate-100"
              >
                <View className="flex-1 pr-3">
                  <Text className="text-slate-800 text-sm">{item.description}</Text>
                  {item.quantity != null && (
                    <Text className="text-slate-400 text-xs mt-0.5">Quantity: {item.quantity}</Text>
                  )}
                </View>
                <Text className="text-slate-800 text-sm font-semibold">
                  {currency || '$'}{` ${item.amount}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          {subtotal != null && (
            <View className="flex-row justify-between mb-1">
              <Text className="text-slate-500 text-sm">Subtotal</Text>
              <Text className="text-slate-700 text-sm">{currency || '$'}{` ${subtotal}`}</Text>
            </View>
          )}
          {tax != null && (
            <View className="flex-row justify-between mb-1">
              <Text className="text-slate-500 text-sm">Taxes</Text>
              <Text className="text-slate-700 text-sm">{currency || '$'}{` ${tax}`}</Text>
            </View>
          )}
          <View className="flex-row justify-between mt-2 pt-2 border-t border-slate-100">
            <Text className="text-slate-900 font-bold text-base">Total</Text>
            <Text className="text-emerald-600 font-bold text-base">{currency || '$'}{` ${total}`}</Text>
          </View>
        </View>
      </ScrollView>

      <View className="flex-row mt-4" style={{ gap: 12 }}>
        <TouchableOpacity
          className="flex-1 bg-white border border-rose-500 px-6 py-3.5 rounded-full items-center active:bg-rose-50"
          onPress={handleReject}
        >
          <Text className="text-rose-600 font-semibold text-base">Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-blue-700 px-6 py-3.5 rounded-full shadow-md items-center active:bg-emerald-700"
          onPress={handleAccept}
        >
          <Text className="text-white font-semibold text-base">Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GeminiResultScreen;

*/