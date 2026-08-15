import createDataContext from './createDataContext';

export const FILTER_TYPES = {
  ALL: 'ALL',       // <-- Agregamos opción para ver todas las facturas
  DAY: 'DAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  CUSTOM: 'CUSTOM',
};

const dateFilterReducer = (state, action) => {
  switch (action.type) {
    case 'set_filter_type':
      return { 
        ...state, 
        filterType: action.payload.filterType,
        dateRange: action.payload.dateRange
      };
    case 'set_custom_range':
      return {
        ...state,
        filterType: FILTER_TYPES.CUSTOM,
        dateRange: action.payload
      };
    case 'show_all':
      return {
        ...state,
        filterType: FILTER_TYPES.ALL,
        dateRange: { startDate: null, endDate: null }
      };
    default:
      return state;
  }
};

// Acciones
const setPredefinedFilter = (dispatch) => (type) => {
  if (type === FILTER_TYPES.ALL) {
    return dispatch({ type: 'show_all' });
  }

  const now = new Date();
  let start = new Date();

  if (type === FILTER_TYPES.DAY) {
    start.setHours(0, 0, 0, 0);
  } else if (type === FILTER_TYPES.WEEK) {
    const dayOfWeek = now.getDay();
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
  } else if (type === FILTER_TYPES.MONTH) {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
  }

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  dispatch({
    type: 'set_filter_type',
    payload: {
      filterType: type,
      dateRange: { startDate: start, endDate: end }
    }
  });
};

const setCustomRange = (dispatch) => (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate || startDate);
  end.setHours(23, 59, 59, 999);

  dispatch({
    type: 'set_custom_range',
    payload: { startDate: start, endDate: end }
  });
};

// ESTADO INICIAL: Inicia en 'ALL' para que NO filtre nada al abrir la app
const initialState = {
  filterType: FILTER_TYPES.ALL,
  dateRange: {
    startDate: null,
    endDate: null
  }
};

export const { Context, Provider } = createDataContext(
  dateFilterReducer,
  {
    setPredefinedFilter,
    setCustomRange
  },
  initialState
);