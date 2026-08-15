import React from 'react';
import { View, Text } from 'react-native';
import PieChart from 'react-native-pie-chart';

/**
 * StorePieChart component renders a styled doughnut chart of invoice amounts by store.
 * Replicates the "Doughnut with fill & Pad Angle" styling from the reference.
 */
const StorePieChart = ({
  series = [],
  overallTotal = 0,
  currency = '$',
  size = 160,
}) => {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <PieChart
        widthAndHeight={size}
        series={series}
        cover={{ radius: 0.65, color: '#fff8e7' }} // Beautiful soft creamy yellow cover fill inside the doughnut
        padAngle={0.03} // Sleek separator gap between the slices
      />

      {/* Absolutely positioned label inside the center cover */}
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text
          className="text-slate-900 font-extrabold"
          style={{ fontSize: Math.max(size * 0.10, 14) }}
          numberOfLines={1}
        >
          {currency} {Number(overallTotal || 0).toFixed(2)}
        </Text>
        <Text
          className="text-slate-500 font-semibold uppercase tracking-wider"
          style={{ fontSize: Math.max(size * 0.06, 9), marginTop: 2 }}
        >
          Total
        </Text>
      </View>
    </View>
  );
};

export default StorePieChart;
