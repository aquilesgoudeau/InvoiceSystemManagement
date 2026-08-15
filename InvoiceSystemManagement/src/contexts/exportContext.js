import createDataContext from './createDataContext';
import axiosApi from '../services/axiosApi';
import { getLastReportEmail, saveLastReportEmail } from '../db/database';

const exportReducer = (state, action) => {
  switch (action.type) {
    case 'set_last_email':
      return { ...state, lastEmail: action.payload };
    case 'sending_report':
      return { ...state, sending: true, error: null, success: false };
    case 'report_sent':
      return { ...state, sending: false, success: true, lastEmail: action.payload };
    case 'report_error':
      return { ...state, sending: false, error: action.payload, success: false };
    case 'reset_export_state':
      return { ...state, error: null, success: false };
    default:
      return state;
  }
};

// Carga el último email usado desde SQLite, para precargarlo en el modal.
const loadLastEmail = (dispatch) => async () => {
  try {
    const email = await getLastReportEmail();
    dispatch({ type: 'set_last_email', payload: email || '' });
  } catch (error) {
    console.log('Error leyendo el último email de reporte:', error);
  }
};

// Envía el reporte al backend. Si tiene éxito, guarda el email como "último usado".
const sendReport = (dispatch) => async ({ invoices, dateRange, email }) => {
  dispatch({ type: 'sending_report' });
  try {
    await axiosApi.post('/reports/send', {
      invoices,
      recipientEmail: email,
      dateRange: {
        startDate: dateRange?.startDate ? dateRange.startDate.toISOString().split('T')[0] : null,
        endDate: dateRange?.endDate ? dateRange.endDate.toISOString().split('T')[0] : null,
      },
    });

    await saveLastReportEmail(email);
    dispatch({ type: 'report_sent', payload: email });
  } catch (error) {
    console.log('Error enviando el reporte:', error);
    const message = error.response?.data?.error || 'Failed to send the report';
    dispatch({ type: 'report_error', payload: message });
  }
};

const resetExportState = (dispatch) => () => {
  dispatch({ type: 'reset_export_state' });
};

export const { Context, Provider } = createDataContext(
  exportReducer,
  { loadLastEmail, sendReport, resetExportState },
  { sending: false, error: null, success: false, lastEmail: '' }
);