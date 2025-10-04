import { useSyncExternalStore } from "react";

function subscribe(callback) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getSnapshot() {
  return window.innerWidth;
}

export default function HookUseSyncExternalStore() {
  const width = useSyncExternalStore(subscribe, getSnapshot);

  return (
    <div>
      <h2>useSyncExternalStore</h2>
      <p>Ancho de ventana: {width}px</p>
       <a href="/">Ir a Home</a>
    </div>
  );
}
