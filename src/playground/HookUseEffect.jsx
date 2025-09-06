import { useState, useEffect } from "react";

export default function HookUseEffect() {
  const [contador, setContador] = useState(0);

  useEffect(() => {
    document.title = `Contador: ${contador}`;
  }, [contador]);

  return (
    <div>
      <h2>useEffect</h2>
      <p>{contador}</p>
      <button onClick={() => setContador(contador + 1)}>Incrementar</button>
    </div>
  );
}
