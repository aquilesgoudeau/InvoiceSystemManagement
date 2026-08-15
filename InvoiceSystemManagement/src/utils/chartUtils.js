/**
 * Utility functions for processing and formatting invoice data for chart visualization.
 */

// Modern, high-contrast color palette to differentiate stores
const PALETTE = [
  '#059669', // emerald-600
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
  '#a855f7', // purple-500
  '#84cc16', // lime-500
  '#6366f1', // indigo-500
  '#d946ef', // fuchsia-500
  '#10b981', // emerald-300
  '#0284c7', // sky-600
  '#eab308', // yellow-500
  '#f43f5e', // rose-500
  '#64748b', // slate-500
  '#22c55e', // green-500
  '#d97706', // amber-200
];

/**
 * Aggregates invoices by vendor (store) name, calculating total amounts and percentages.
 * 
 * @param {Array} invoices - The raw invoices array
 * @returns {Array} List of aggregated stores sorted by total amount descending
 */
export const aggregateInvoicesByStore = (invoices = []) => {
  const storeMap = {};
  let overallTotal = 0;

  invoices.forEach((invoice) => {
    const name = (invoice.vendorName || 'Sin proveedor').trim();
    const amount = Number(invoice.total) || 0;
    overallTotal += amount;

    if (storeMap[name]) {
      storeMap[name] += amount;
    } else {
      storeMap[name] = amount;
    }
  });

  // Convert to array and sort descending by total amount
  const aggregated = Object.keys(storeMap).map((name, index) => {
    const total = storeMap[name];
    const percentage = overallTotal > 0 ? (total / overallTotal) * 100 : 0;
    const color = PALETTE[index % PALETTE.length];

    return {
      vendorName: name,
      total,
      percentage,
      color,
    };
  }).sort((a, b) => b.total - a.total);

  return {
    aggregated,
    overallTotal,
  };
};

/**
 * Generates the series structure expected by react-native-pie-chart (v4).
 * Handles empty states gracefully to avoid library errors.
 * 
 * @param {Array} aggregatedData - Aggregated store data
 * @param {number} overallTotal - Overall total of all invoices
 * @returns {Array} Series array for the PieChart
 */
export const getPieChartSeries = (aggregatedData = [], overallTotal = 0) => {
  if (aggregatedData.length === 0 || overallTotal === 0) {
    // Graceful fallback for empty state to prevent the chart from throwing
    return [
      {
        value: 1,
        color: '#e2e8f0', // Cool gray 200
        label: { text: '', fontSize: 10 },
      },
    ];
  }

  return aggregatedData.map((store) => ({
    value: store.total,
    color: store.color,
    label: {
      text: `${store.percentage.toFixed(0)}%`,
      fontSize: 11,
      fontWeight: 'bold',
      fill: '#ffffff', // white label text inside slices
    },
  }));
};

/**
 * Generates the series structure for react-native-pie-chart (v4) without labels.
 * Used for simplified visual previews.
 * 
 * @param {Array} aggregatedData - Aggregated store data
 * @param {number} overallTotal - Overall total of all invoices
 * @returns {Array} Series array for the PieChart
 */
export const getPieChartSeriesWithoutLabels = (aggregatedData = [], overallTotal = 0) => {
  if (aggregatedData.length === 0 || overallTotal === 0) {
    return [
      {
        value: 1,
        color: '#e2e8f0', // Cool gray 200
      },
    ];
  }

  return aggregatedData.map((store) => ({
    value: store.total,
    color: store.color,
  }));
};
