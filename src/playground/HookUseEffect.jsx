import { useState, useEffect } from "react";

function UseEffectExample() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("Aún no has hecho clic");

  useEffect(() => {
    if (count > 0) {
      setMessage(`Has hecho clic ${count} veces`);
    }
  }, [count]);

  return (
    <div>
      <h2>Ejemplo de useEffect</h2>
      <p>{message}</p>
      <button onClick={() => setCount(count + 1)}>Clic</button>
      <a href="/">Ir a Home</a>

    </div>
  );
}

export default UseEffectExample;
