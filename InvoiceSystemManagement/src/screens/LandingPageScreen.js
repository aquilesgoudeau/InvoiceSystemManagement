import React, { useContext, useCallback, useMemo } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CreateScannerButton from '../components/landingPageComponent/createScannerButton';
import DashboardLanding from '../components/landingPageComponent/dashboardLanding';
import ListaInvoices from '../components/landingPageComponent/listaInvoices';
import ExportReportButton from '../components/landingPageComponent/exportReportButton'

import { Context as ScannerContext } from '../contexts/scannerContext';
import { Context as DateFilterContext, FILTER_TYPES } from '../contexts/dateFilterContext';
import { CalendarDateFilterButton } from '../components/calendarComponent/calendarDateFilter';
import SignOutComponent from '../components/signOutComponent';

const LandingPageScreen = () => {
  const { state: scannerState, fetchInvoices } = useContext(ScannerContext);
  const { invoices } = scannerState;

  const { state: dateState } = useContext(DateFilterContext);
  const { filterType, dateRange } = dateState;

  useFocusEffect(
    useCallback(() => {
      fetchInvoices();
    }, [])
  );

  // Lógica segura de filtrado
  const filteredInvoices = useMemo(() => {
    // Si no hay array de facturas, retornamos vacío
    if (!invoices || !Array.isArray(invoices)) return [];

    // SI EL FILTRO ES 'ALL' (ESTADO INICIAL), RETORNA TAL CUAL TODA LA DATA
    if (filterType === FILTER_TYPES.ALL || !dateRange.startDate) {
      return invoices;
    }

    // De lo contrario, filtra comparando las fechas
    return invoices.filter((inv) => {
      //const rawDate = inv.date || inv.created_at || inv.createdAt;
      const rawDate = inv.invoiceDate || inv.date || inv.created_at || inv.createdAt;
      if (!rawDate) return true; // Si la factura no tiene fecha, la muestra igual

      const invDate = new Date(rawDate);
      if (isNaN(invDate.getTime())) return true; // Si la fecha está mal formateada, no la oculta

      return invDate >= dateRange.startDate && invDate <= dateRange.endDate;
    });
  }, [invoices, dateState]);

  return (
    <View className="flex-1 bg-slate-100 px-6 pt-16 pb-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-4 ml-4 mr-2">
          <Text className="text-3xl font-black text-slate-900">Invoices</Text>
          <SignOutComponent />
        </View>
        
          
           <CalendarDateFilterButton/>
            
        {/* Pasamos filteredInvoices que por defecto contiene el 100% de tus datos */}
        <DashboardLanding invoices={filteredInvoices} />
          <View className="mt-4 mb-2">
        <ExportReportButton invoices={filteredInvoices} dateRange={dateRange} />
      </View>
        <View className="mt-4">
          <ListaInvoices invoices={filteredInvoices} />
        </View>
      </ScrollView>
 
      <CreateScannerButton />
    </View>
  );
};

export default LandingPageScreen;


