import React, { useReducer, useMemo } from 'react';

export default (reducer, actions, defaultValue) => {
  const Context = React.createContext();

  const Provider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, defaultValue);

    // Memorizamos las acciones para que no se re-creen en cada renderizado
    const boundActions = useMemo(() => {
      const bound = {};
      for (let key in actions) {
        bound[key] = actions[key](dispatch);
      }
      return bound;
    }, [dispatch]);

    return (
      <Context.Provider value={{ state, ...boundActions }}>
        {children}
      </Context.Provider>
    );
  };

  return { Context, Provider };
};
