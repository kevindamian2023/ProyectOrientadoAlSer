import { useFormStatus } from "react-dom";

export default function HookUseFormStatus() {
  return (
    <form action={() => new Promise((res) => setTimeout(res, 1000))}>
      <BotonEnviar />
    </form>
  );
}

function BotonEnviar() {
  const status = useFormStatus();
  return (
  <>
  <button disabled={status.pending}>{status.pending ? "Enviando..." : "Enviar"}</button>
         <a href="/">Ir a Home</a>
    </>
  );
}
