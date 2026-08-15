import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Context as ScannerContext } from '../contexts/scannerContext';

const DetailsScreen = () => {
  const { state, backToList, deleteInvoiceRecord } = useContext(ScannerContext);
  const { selectedInvoice } = state;

  const handleDelete = () => {
    Alert.alert(
      'Delete invoice',
      'Are you sure you want to delete this invoice?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteInvoiceRecord(selectedInvoice.id),
        },
      ]
    );
  };

  if (!selectedInvoice) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-6">
        <Text className="text-slate-500 text-sm text-center mb-6">
          No invoice selected.
        </Text>
        <TouchableOpacity
          className="bg-emerald-600 px-8 py-3.5 rounded-full shadow-md active:bg-emerald-700"
          onPress={backToList}
        >
          <Text className="text-white font-semibold text-base">Back to List</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {
    vendorName,
    abn,
    invoiceNumber,
    invoiceDate,
    currency,
    subtotal,
    tax,
    total,
    items,
  } = selectedInvoice;

  return (
    <View className="flex-1 bg-slate-100 px-6 pt-16 pb-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-black text-slate-900 mb-6">
          Invoice Details
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
            <Text className="text-slate-500 text-sm">{invoiceDate}</Text>
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
              <Text className="text-slate-500 text-sm">GST</Text>
              <Text className="text-slate-700 text-sm">{currency || '$'}{` ${tax}`}</Text>
            </View>
          )}
          <View className="flex-row justify-between mt-2 pt-2 border-t border-slate-100">
            <Text className="text-slate-900 font-bold text-base">Total</Text>
            <Text className="text-blue-600 font-bold text-base">{currency || '$'}{` ${total}`}</Text>
          </View>
        </View>
      </ScrollView>

      <View className="flex-row mt-4" style={{ gap: 12 }}>
        <TouchableOpacity
          className="flex-1 bg-white border border-rose-500 px-6 py-3.5 rounded-full items-center active:bg-rose-50"
          onPress={handleDelete}
        >
          <Text className="text-rose-600 font-semibold text-base">Delete Record</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-blue-700 px-6 py-3.5 rounded-full shadow-md items-center active:bg-blue-400"
          onPress={backToList}
        >
          <Text className="text-white font-semibold text-base">Back to List</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DetailsScreen;