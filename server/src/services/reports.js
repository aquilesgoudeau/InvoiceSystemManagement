export const generateInvoicesCSV = (invoices) => {
  const headers = ['Fecha', 'Proveedor', 'ABN', 'N Factura', 'Subtotal', 'GST', 'Total', 'Categoria'];

  const escapeField = (value) => {
    const str = value === undefined || value === null ? '' : String(value);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = invoices.map(inv => [
    inv.invoiceDate || '',
    inv.vendorName || '',
    inv.abn || '',
    inv.invoiceNumber || '',
    inv.subtotal !== undefined ? Number(inv.subtotal).toFixed(2) : '',
    inv.tax !== undefined ? Number(inv.tax).toFixed(2) : '',
    inv.total !== undefined ? Number(inv.total).toFixed(2) : '',
    inv.category || '',
  ].map(escapeField).join(','));

  return [headers.map(escapeField).join(','), ...rows].join('\n');
};

export const buildReportFileName = (dateRange) => {
  const start = dateRange?.startDate || 'inicio';
  const end = dateRange?.endDate || 'fin';
  return `facturas_${start}_${end}.csv`;
};