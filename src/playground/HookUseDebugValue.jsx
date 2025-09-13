import { useDebugValue, useState } from "react";

function useContador() {
  const [count, setCount] = useState(0);
  useDebugValue(count > 5 ? "Alto" : "Bajo");
  return [count, setCount];
}

export default function HookUseDebugValue() {
  const [count, setCount] = useContador();

  return (
    <div>
      <h2>useDebugValue</h2>
      <p>Contador: {count}</p>
      <button onClick={() => setCount(count + 1)}>Incrementar</button>
                 <a href="/">Ir a Home</a>

    </div>
  );
}
