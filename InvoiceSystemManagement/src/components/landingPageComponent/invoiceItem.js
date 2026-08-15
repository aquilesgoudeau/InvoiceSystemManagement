import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Context as ScannerContext } from '../../contexts/scannerContext';

const InvoiceItem = ({ invoice }) => {
  const { selectInvoice } = useContext(ScannerContext);
  const { vendorName, total, invoiceDate, currency } = invoice;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => selectInvoice(invoice)}
      className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-3.5 mb-3 shadow-sm"
    >
      <View className="flex-1 pr-3">
        <Text className="text-slate-900 font-semibold text-sm" numberOfLines={1}>
          {vendorName || 'Sin proveedor'}
        </Text>
        {invoiceDate && (
          <Text className="text-blue-800 text-xs mt-0.5">{invoiceDate}</Text>
        )}
      </View>

      <View className="flex-row items-center">
        <Text className="text-slate-900 font-bold text-sm mr-2">
          {currency || '$'} {Number(total || 0).toFixed(2)}
        </Text>
        <Text className="text-emerald-600 text-xl">›</Text>
      </View>
    </TouchableOpacity>
  );
};

export default InvoiceItem;