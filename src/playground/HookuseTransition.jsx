import { useState, useTransition } from "react";

function ListaGrande() {
  const [input, setInput] = useState("");
  const [list, setList] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    setInput(e.target.value);
    startTransition(() => {
      const items = Array(1000).fill(null).map((_, i) => e.target.value + i);
      setList(items);
    });
  };

  return (
    <div>
      <input value={input} onChange={handleChange} placeholder="Escribe algo" />
      {isPending ? <p>Cargando...</p> : list.slice(0, 5).map((item, i) => <div key={i}>{item}</div>)}
    </div>
  );
}
export default ListaGrande;
