import React from 'react';
import { View, Text } from 'react-native';
import { aggregateInvoicesByStore, getPieChartSeries } from '../../utils/chartUtils';
import StorePieChart from '../landingPageComponent/storePieChart';
import ChartLegend from './chartLegend';

/**
 * DashboardStacts renders the full comprehensive analysis of expenses by store,
 * including a large pie chart with percentage slices and a full detailed breakdown list.
 */
const DashboardStacts = ({ invoices = [] }) => {
  const currency = invoices.find((inv) => inv.currency)?.currency || '$';

  // 1. Calculate aggregated store totals and overall sum
  const { aggregated, overallTotal } = aggregateInvoicesByStore(invoices);

  // 2. Generate the series structure needed for react-native-pie-chart (v4)
  const series = getPieChartSeries(aggregated, overallTotal);

  return (
    <View className="w-full bg-white rounded-2xl p-5 shadow-sm items-center">
      <Text className="text-slate-900 font-bold text-base mb-4 self-start">Expense Distribution</Text>

      {/* Doughnut Chart with separator gap and labels inside slices */}
      <StorePieChart
        series={series}
        overallTotal={overallTotal}
        currency={currency}
        size={180} // Slightly larger for better readability on the dedicated stats tab
      />

      {/* Full store breakdown list with colors and percentages */}
      <ChartLegend aggregatedData={aggregated} currency={currency} />
    </View>
  );
};

export default DashboardStacts;
