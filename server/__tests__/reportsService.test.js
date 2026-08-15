import { generateInvoicesCSV, buildReportFileName } from '../src/services/reports.js';

describe('reports service', () => {
  describe('generateInvoicesCSV', () => {
    it('generates a header row even with an empty invoices array', () => {
      const csv = generateInvoicesCSV([]);
      const lines = csv.split('\n');

      expect(lines).toHaveLength(1);
      expect(lines[0]).toBe(
        '"Fecha","Proveedor","ABN","N Factura","Subtotal","GST","Total","Categoria"'
      );
    });

    it('formats a fully populated invoice correctly', () => {
      const csv = generateInvoicesCSV([
        {
          invoiceDate: '2026-08-15',
          vendorName: 'Woolworths',
          abn: '21000014236',
          invoiceNumber: 'INV-10023',
          subtotal: 40,
          tax: 5.5,
          total: 45.5,
          category: 'Groceries',
        },
      ]);
      const rows = csv.split('\n');

      expect(rows[1]).toBe(
        '"2026-08-15","Woolworths","21000014236","INV-10023","40.00","5.50","45.50","Groceries"'
      );
    });

    it('falls back to empty strings for missing (undefined) fields', () => {
      const csv = generateInvoicesCSV([{}]);
      const rows = csv.split('\n');

      expect(rows[1]).toBe('"","","","","","","",""');
    });

    it('treats 0 as a real value, not a missing field', () => {
      // subtotal/tax/total use `!== undefined`, so 0 must format as "0.00",
      // not fall through to the '' branch like a truthy check would.
      const csv = generateInvoicesCSV([
        { subtotal: 0, tax: 0, total: 0 },
      ]);
      const rows = csv.split('\n');

      expect(rows[1]).toBe('"","","","","0.00","0.00","0.00",""');
    });

    it('escapes double quotes inside field values', () => {
      const csv = generateInvoicesCSV([
        { vendorName: 'Bob\'s "Best" Store' },
      ]);
      const rows = csv.split('\n');

      // A literal " inside a value must become "" per CSV escaping rules
      expect(rows[1]).toContain('"Bob\'s ""Best"" Store"');
    });

    it('treats null fields the same as undefined', () => {
      const csv = generateInvoicesCSV([
        { vendorName: null, abn: null, subtotal: null },
      ]);
      const rows = csv.split('\n');

      // subtotal is null, not undefined, so it still hits the "!== undefined"
      // true branch — Number(null) is 0, so we expect "0.00" here, not ''.
      expect(rows[1]).toBe('"","","","","0.00","","",""');
    });

    it('handles multiple invoices, producing one row each', () => {
      const csv = generateInvoicesCSV([
        { vendorName: 'A', total: 10 },
        { vendorName: 'B', total: 20 },
      ]);
      const rows = csv.split('\n');

      expect(rows).toHaveLength(3); // header + 2 rows
      expect(rows[1]).toContain('"A"');
      expect(rows[2]).toContain('"B"');
    });
  });

  describe('buildReportFileName', () => {
    it('builds a filename from a complete dateRange', () => {
      const name = buildReportFileName({ startDate: '2026-01-01', endDate: '2026-01-31' });
      expect(name).toBe('facturas_2026-01-01_2026-01-31.csv');
    });

    it('falls back to "inicio" and "fin" when dateRange is undefined', () => {
      const name = buildReportFileName(undefined);
      expect(name).toBe('facturas_inicio_fin.csv');
    });

    it('falls back to "inicio" and "fin" when dateRange is an empty object', () => {
      const name = buildReportFileName({});
      expect(name).toBe('facturas_inicio_fin.csv');
    });

    it('falls back only for the missing side when dateRange is partial', () => {
      expect(buildReportFileName({ startDate: '2026-01-01' })).toBe(
        'facturas_2026-01-01_fin.csv'
      );
      expect(buildReportFileName({ endDate: '2026-01-31' })).toBe(
        'facturas_inicio_2026-01-31.csv'
      );
    });
  });
});