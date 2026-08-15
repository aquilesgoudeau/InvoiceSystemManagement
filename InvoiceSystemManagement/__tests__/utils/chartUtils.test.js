import {
  aggregateInvoicesByStore,
  getPieChartSeries,
  getPieChartSeriesWithoutLabels,
} from '../../src/utils/chartUtils';

describe('chartUtils unit tests', () => {
  describe('aggregateInvoicesByStore', () => {
    it('should return empty results when no invoices are provided', () => {
      const result = aggregateInvoicesByStore([]);
      expect(result.aggregated).toEqual([]);
      expect(result.overallTotal).toBe(0);
    });

    it('should handle undefined/null input gracefully', () => {
      const result = aggregateInvoicesByStore(undefined);
      expect(result.aggregated).toEqual([]);
      expect(result.overallTotal).toBe(0);
    });

    it('should aggregate totals by vendorName and sort them in descending order of totals', () => {
      const mockInvoices = [
        { vendorName: 'Store A', total: 100 },
        { vendorName: 'Store B', total: 300 }, // Make Store B clearly higher so sort order is deterministic
        { vendorName: 'Store A', total: 150 },
        { vendorName: 'Store C', total: 50 },
      ];

      const result = aggregateInvoicesByStore(mockInvoices);

      // Total overall: 100 + 300 + 150 + 50 = 600
      expect(result.overallTotal).toBe(600);
      expect(result.aggregated).toHaveLength(3);

      // First should be Store B (300 total, 50%)
      expect(result.aggregated[0].vendorName).toBe('Store B');
      expect(result.aggregated[0].total).toBe(300);
      expect(result.aggregated[0].percentage).toBe(50);

      // Second should be Store A (250 total, ~41.67%)
      expect(result.aggregated[1].vendorName).toBe('Store A');
      expect(result.aggregated[1].total).toBe(250);

      // Third should be Store C (50 total, ~8.33%)
      expect(result.aggregated[2].vendorName).toBe('Store C');
      expect(result.aggregated[2].total).toBe(50);
    });

    it('should fall back to "Sin proveedor" if vendorName is empty or null', () => {
      const mockInvoices = [
        { vendorName: '', total: 80 },
        { vendorName: null, total: 20 },
      ];

      const result = aggregateInvoicesByStore(mockInvoices);
      expect(result.overallTotal).toBe(100);
      expect(result.aggregated).toHaveLength(1);
      expect(result.aggregated[0].vendorName).toBe('Sin proveedor');
      expect(result.aggregated[0].total).toBe(100);
    });

    it('should coerce total strings to numbers correctly', () => {
      const mockInvoices = [
        { vendorName: 'Store A', total: '150.50' },
        { vendorName: 'Store B', total: '49.50' },
      ];

      const result = aggregateInvoicesByStore(mockInvoices);
      expect(result.overallTotal).toBe(200);
      expect(result.aggregated[0].total).toBe(150.50);
      expect(result.aggregated[1].total).toBe(49.50);
    });
  });

  describe('getPieChartSeries', () => {
    it('should return a default slice when aggregated data or overall total is empty', () => {
      const seriesEmpty = getPieChartSeries([], 0);
      expect(seriesEmpty).toHaveLength(1);
      expect(seriesEmpty[0].value).toBe(1);
      expect(seriesEmpty[0].color).toBe('#e2e8f0');
    });

    it('should map aggregated stores to pie chart structure with percentage labels', () => {
      const mockAggregated = [
        { vendorName: 'Store B', total: 300, percentage: 60, color: '#ff0000' },
        { vendorName: 'Store A', total: 200, percentage: 40, color: '#00ff00' },
      ];

      const series = getPieChartSeries(mockAggregated, 500);
      expect(series).toHaveLength(2);
      expect(series[0]).toEqual({
        value: 300,
        color: '#ff0000',
        label: {
          text: '60%',
          fontSize: 11,
          fontWeight: 'bold',
          fill: '#ffffff',
        },
      });
      expect(series[1]).toEqual({
        value: 200,
        color: '#00ff00',
        label: {
          text: '40%',
          fontSize: 11,
          fontWeight: 'bold',
          fill: '#ffffff',
        },
      });
    });
  });

  describe('getPieChartSeriesWithoutLabels', () => {
    it('should return a default slice without labels when empty', () => {
      const series = getPieChartSeriesWithoutLabels([], 0);
      expect(series).toHaveLength(1);
      expect(series[0].value).toBe(1);
      expect(series[0].color).toBe('#e2e8f0');
    });

    it('should map aggregated stores without labels', () => {
      const mockAggregated = [
        { vendorName: 'Store B', total: 300, percentage: 60, color: '#ff0000' },
      ];
      const series = getPieChartSeriesWithoutLabels(mockAggregated, 300);
      expect(series).toHaveLength(1);
      expect(series[0]).toEqual({
        value: 300,
        color: '#ff0000',
      });
    });
  });
});
