import { useState, useDeferredValue } from "react";

function TextoDiferido() {
  const [text, setText] = useState("");
  const deferredText = useDeferredValue(text);

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <p>Texto inmediato: {text}</p>
      <p>Texto diferido: {deferredText}</p>
    </div>
  );
}
export default TextoDiferido;
