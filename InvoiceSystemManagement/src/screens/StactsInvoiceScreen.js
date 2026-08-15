import React, { useContext, useCallback, useMemo } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Context as ScannerContext } from '../contexts/scannerContext';
import DashboardStacts from '../components/stactsInvoiceComponent/dashboardStacts';

import { Context as DateFilterContext, FILTER_TYPES } from '../contexts/dateFilterContext';
import { CalendarDateFilterButton } from '../components/calendarComponent/calendarDateFilter';
import SignOutComponent from '../components/signOutComponent';


const StactsInvoiceScreen = () => {
  const { state: scannerState, fetchInvoices } = useContext(ScannerContext);
  const { invoices } = scannerState;

  // Extraemos el estado compartido del filtro de fechas
  const { state: dateState } = useContext(DateFilterContext);
  const { filterType, dateRange } = dateState;

  // Refresca la lista de facturas cada vez que esta pestaña recibe el foco
  useFocusEffect(
    useCallback(() => {
      fetchInvoices();
    }, [])
  );

  // Filtrado seguro que por defecto (FILTER_TYPES.ALL) devuelve el 100% de los datos
  const filteredInvoices = useMemo(() => {
    if (!invoices || !Array.isArray(invoices)) return [];

    // SI EL FILTRO ES 'ALL' O NO HAY FECHA INICIAL, RETORNA TODA LA DATA
    if (filterType === FILTER_TYPES.ALL || !dateRange.startDate) {
      return invoices;
    }

    // Filtra comparando las fechas de forma segura
    return invoices.filter((inv) => {
      const rawDate = inv.date || inv.created_at || inv.createdAt;
      if (!rawDate) return true; // Si la factura no tiene fecha, no la oculta

      const invDate = new Date(rawDate);
      if (isNaN(invDate.getTime())) return true; // Si la fecha no es válida, no la oculta

      return invDate >= dateRange.startDate && invDate <= dateRange.endDate;
    });
  }, [invoices, dateState]);

  return (
    <View className="flex-1 bg-slate-100 px-6 pt-16 pb-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-4 ml-4 mr-2">
          <Text className="text-3xl font-black text-slate-900">Analysis</Text>
          <SignOutComponent />
        </View>
        
        {/* Barra de Filtros estilo Google Flights sincronizada */}
        <CalendarDateFilterButton/>

        <DashboardStacts invoices={filteredInvoices} />
      </ScrollView>
    </View>
  );
};

export default StactsInvoiceScreen;
