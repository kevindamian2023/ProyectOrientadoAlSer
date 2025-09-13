import React, { useInsertionEffect, useState } from "react";

function HookUseInsertionEffect() {
  const [color, setColor] = useState("blue");

  useInsertionEffect(() => {
    // Crear e insertar una regla CSS dinámica
    const style = document.createElement("style");
    style.innerHTML = `
      .dynamic-text {
        color: ${color};
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);

    // Limpieza al desmontar
    return () => {
      document.head.removeChild(style);
    };
  }, [color]);

  return (
    <div>
      <p className="dynamic-text">Este texto cambia de color dinámicamente</p>
      <button onClick={() => setColor("red")}>Rojo</button>
      <button onClick={() => setColor("green")}>Verde</button>
      <button onClick={() => setColor("blue")}>Azul</button>
      <a href="/">Ir a Home</a>
    </div>
  );
}

export default HookUseInsertionEffect;
