import { useState, useCallback } from "react";

function BotonMemo() {
  const [count, setCount] = useState(0);

  const incrementar = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return (
    <div>
      <p>Contador: {count}</p>
      <button onClick={incrementar}>+1</button>
    </div>
  );
}
export default BotonMemo;