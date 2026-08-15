import React from 'react';
import { View, Text } from 'react-native';
import InvoiceItem from './invoiceItem';

const ListaInvoices = ({ invoices = [] }) => {
  if (invoices.length === 0) {
    return (
      <View className="w-full items-center py-6">
        <Text className="text-slate-400 text-sm">
          There are no saved invoices yet.
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full">
      {invoices.map((invoice) => (
        <InvoiceItem key={invoice.id} invoice={invoice} />
      ))}
    </View>
  );
};

export default ListaInvoices;