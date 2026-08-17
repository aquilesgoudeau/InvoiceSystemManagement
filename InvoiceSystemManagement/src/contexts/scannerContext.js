import createDataContext from './createDataContext';
import { navigate, goBack,resetTo } from '../navigation/navigationRef';
import axiosApi from '../services/axiosApi'
import { saveInvoice, getAllInvoices, deleteInvoice } from '../db/database'
 
const scannerReducer = (state, action) => {
  switch (action.type) {
    case 'save_scan':
      return { ...state, result: action.payload };
    case 'clear_scan':
      return { ...state, result: null, errorMessage: '' };
    case 'scan_accepted':
      return { ...state, scannedUri: action.payload };
    case 'error_scan':
      return {...state, errorMessage: action.payload}
    case 'set_invoices':
      return { ...state, invoices: action.payload };
    case 'select_invoice':
      return { ...state, selectedInvoice: action.payload };
    case 'clear_selected_invoice':
      return { ...state, selectedInvoice: null };
    default:
      return state;
  }
};
 
const geminiScan = (dispatch) => async (scannedResult) => {
 
const payload = new FormData();
   payload.append('image', scannedResult.fileToUpload);
 
try {
  const response = await axiosApi.post('/api/scan',payload, { headers:{ 'Content-Type': 'multipart/form-data' }})
  dispatch({ type: 'save_scan', payload: response.data})
       console.log(response.data);
       navigate('GeminiResult');
 
} catch (error) {
  console.log("Error detallado with request:", error);
   dispatch({ type: 'error_scan', payload: "error con axios"})
   navigate('GeminiResult');
}
};
const clearScan = (dispatch) => () => {
    dispatch({ type: 'clear_scan' });
  };
 
 
// El usuario confirma que el resultado de Gemini es correcto: lo persistimos
// en SQLite y volvemos a Home (donde están las pestañas principales).
const acceptInvoice = (dispatch) => async (invoiceData) => {
  try {
    await saveInvoice(invoiceData);
    dispatch({ type: 'clear_scan' });
    navigate('Home');
  } catch (error) {
    console.log('Error guardando la factura en SQLite:', error);
    dispatch({ type: 'error_scan', payload: 'No se pudo guardar la factura.' });
  }
};
 
const rejectScan = (dispatch) => () => {
    dispatch({ type: 'clear_scan' });
    navigate('Home');
  };
 
 
const fetchInvoices = (dispatch) => async () => {
  try {
    const invoices = await getAllInvoices();
    dispatch({ type: 'set_invoices', payload: invoices });
    console.log('Facturas guardadas en SQLite:', invoices);
  } catch (error) {
    console.log('Error leyendo facturas de SQLite:', error);
  }
};
 
// El usuario tocó un item de la lista: guardamos esa factura como
// "seleccionada" y navegamos al detalle.
const selectInvoice = (dispatch) => (invoice) => {
  dispatch({ type: 'select_invoice', payload: invoice });
  navigate('Details');
};
 
// Botón "Back to List" del detalle: vuelve a Home.
const backToList = (dispatch) => () => {
  goBack();
};
 
// Botón "Delete Record" del detalle: borra de SQLite, refresca la lista
// en el state y vuelve a Home.
const deleteInvoiceRecord = (dispatch) => async (id) => {
  try {
    await deleteInvoice(id);
    const invoices = await getAllInvoices();
    dispatch({ type: 'set_invoices', payload: invoices });
    goBack();
  } catch (error) {
    console.log('Error eliminando la factura de SQLite:', error);
    dispatch({ type: 'error_scan', payload: 'Failed to delete the invoice' });
  }
};
 
const handleScanCancel = (dispatch) => () => {
    dispatch({ type: 'clear_scan' });
    navigate('Home');
  };
 
const handleScanAccept = (dispatch) => (uri) => {
    dispatch({ type: 'scan_accepted', payload: uri });
    navigate('Preview');
  };
 
 
export const { Context, Provider } = createDataContext(
  scannerReducer,
  {
    geminiScan,
    clearScan,
    handleScanCancel,
    handleScanAccept,
    acceptInvoice,
    rejectScan,
    fetchInvoices,
    selectInvoice,
    backToList,
    deleteInvoiceRecord,
  },
  { result: null, scannedUri: null, errorMessage: '', invoices: [], selectedInvoice: null }
);