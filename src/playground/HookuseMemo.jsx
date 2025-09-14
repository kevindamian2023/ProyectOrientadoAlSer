import { useMemo, useState } from "react";

function ExpensiveCalc() {
  const [num, setNum] = useState(0);

  const doble = useMemo(() => {
    console.log("Calculando...");
    return num * 2;
  }, [num]);

  return (
    <div>
      <p>Número: {num} | Doble: {doble}</p>
      <button onClick={() => setNum(num + 1)}>+1</button>
    </div>
  );
}
export default ExpensiveCalc;
