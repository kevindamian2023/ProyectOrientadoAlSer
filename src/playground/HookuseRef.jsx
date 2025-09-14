import { useRef } from "react";

function InputFocus() {
  const inputRef = useRef();

  return (
    <div>
      <input ref={inputRef} placeholder="Escribe aquí" />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
    </div>
  );
}
export default InputFocus;