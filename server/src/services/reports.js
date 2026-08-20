export const generateInvoicesCSV = (invoices) => {
  const headers = ['Date', 'Vendor', 'ABN', 'Invoice N', 'Subtotal', 'GST', 'Total', 'Category'];

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

const toFileNameDate = (input) => {
  if (!input) return null;

  let date;
  if (input instanceof Date) {
    date = input;
  } else if (typeof input === 'string') {
    const cleanDateStr = input.split('T')[0];
    const parts = cleanDateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(input);
    }
  } else {
    date = new Date(input);
  }

  if (isNaN(date?.getTime())) return null;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const buildReportFileName = (dateRange) => {
  const rawStart = dateRange?.startDate || dateRange?.from || dateRange?.start;
  const rawEnd = dateRange?.endDate || dateRange?.to || dateRange?.end;

  const start = toFileNameDate(rawStart) || 'Start';
  const end = toFileNameDate(rawEnd) || 'End';

  return `Invoices_${start}_${end}.csv`;
};


/*
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
  const start = dateRange?.startDate || 'Start';
  const end = dateRange?.endDate || 'End';
  return `Invoices_${start}_${end}.csv`;
};
*/