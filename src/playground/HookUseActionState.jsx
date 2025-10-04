import { useActionState } from "react";

async function enviar(prev, formData) {
  return `Hola ${formData.get("nombre")}`;
}

export default function HookUseActionState() {
  const [mensaje, formAction] = useActionState(enviar, "Esperando...");

  return (
    <>
    <form action={formAction}>
      <input name="nombre" placeholder="Nombre" />
      <button>Enviar</button>
      <p>{mensaje}</p>
    </form>
     <a href="/">Ir a Home</a>
</>
  );
}
