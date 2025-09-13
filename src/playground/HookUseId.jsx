import { useId } from "react";

export default function HookUseId() {
  const id = useId();

  return (
    <div>
      <h2>useId</h2>
      <label htmlFor={id}>Nombre:</label>
      <input id={id} type="text" />
       <a href="/">Ir a Home</a>
    </div>
  );
}
