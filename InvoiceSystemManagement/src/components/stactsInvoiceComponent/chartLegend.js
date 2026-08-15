import React from 'react';
import { View, Text } from 'react-native';

/**
 * ChartLegend component displays a detailed breakdown of invoices by store.
 * Lists store names, assigned slice colors, absolute totals, and percentage contributions.
 */
const ChartLegend = ({ aggregatedData = [], currency = '$' }) => {
  if (aggregatedData.length === 0) {
    return (
      <View className="w-full mt-4 items-center">
        <Text className="text-slate-400 text-xs italic">No store data available to breakdown.</Text>
      </View>
    );
  }

  return (
    <View className="w-full mt-6 px-1 animate-fade-in">
      <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-3">
        Distribution by Store
      </Text>
      <View className="flex-col gap-2">
        {aggregatedData.map((store, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between py-2 border-b border-slate-50"
          >
            {/* Store Color and Name */}
            <View className="flex-row items-center flex-1 pr-4">
              <View
                className="w-3.5 h-3.5 rounded-full mr-2.5 shadow-sm"
                style={{ backgroundColor: store.color }}
              />
              <Text className="text-slate-700 font-semibold text-sm pr-8" numberOfLines={1}>
                {store.vendorName}
              </Text>
            </View>

            {/* Store Amount and Percentage */}
            <View className="flex-row items-center" style={{ gap: 10 }}>
              <Text className="text-slate-900 font-bold text-sm">
                {currency} {store.total.toFixed(2)}
              </Text>
              <View className="bg-slate-100 px-2 py-0.5 rounded-md min-w-[36px] items-center">
                <Text className="text-slate-500 font-bold text-[10px]">
                  {store.percentage.toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ChartLegend;
