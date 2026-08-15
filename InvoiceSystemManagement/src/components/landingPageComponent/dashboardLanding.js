import React from 'react';
import { View, Text } from 'react-native';
import { aggregateInvoicesByStore, getPieChartSeriesWithoutLabels } from '../../utils/chartUtils';
import StorePieChart from './storePieChart';


const DashboardLanding = ({ invoices = [] }) => {
  const currency = invoices.find((inv) => inv.currency)?.currency || '$';

  // 1. Calculate aggregated store totals and overall sum
  const { aggregated, overallTotal } = aggregateInvoicesByStore(invoices);

  // 2. Generate the series without percentage labels inside the slices
  const series = getPieChartSeriesWithoutLabels(aggregated, overallTotal);

  return (
    <View className="w-full bg-white rounded-2xl p-5 shadow-sm items-center">
      <Text className="text-slate-900 font-bold text-base mb-4 self-start">Expense Summary</Text>

      {/* Clean multi-color Doughnut chart without label percentages */}
      <StorePieChart
        series={series}
        overallTotal={overallTotal}
        currency={currency}
        size={160}
      />
    </View>
  );
};

export default DashboardLanding;
