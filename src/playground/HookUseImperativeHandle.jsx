import { forwardRef, useImperativeHandle, useRef } from "react";

const Input = forwardRef((props, ref) => {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
  }));
  return <input ref={inputRef} />;
});

export default function HookUseImperativeHandle() {
  const inputRef = useRef();
  return (
    <div>
      <h2>useImperativeHandle</h2>
      <Input ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focar desde padre</button>
       <a href="/">Ir a Home</a>
    </div>
  );
}
