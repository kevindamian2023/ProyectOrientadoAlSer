import { useLayoutEffect, useRef } from "react";

function Caja() {
  const divRef = useRef();

  useLayoutEffect(() => {
    console.log("Tamaño:", divRef.current.getBoundingClientRect());
  }, []);

  return <div ref={divRef} style={{ width: 100, height: 100, background: "tomato" }} />;
}
export default Caja;