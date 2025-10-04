import React, { useReducer } from 'react';

// 1. Estado inicial
const initialState = { count: 0 };

// 2. Reducer
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      throw new Error('Acción no válida');
  }
}

// 3. Componente
function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <h2>Contador: {state.count}</h2>
      <button onClick={() => dispatch({ type: 'increment' })}>➕ Incrementar</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>➖ Decrementar</button>
      <button onClick={() => dispatch({ type: 'reset' })}>🔁 Resetear</button>
    </div>
  );
}

export default Counter;
