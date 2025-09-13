import { useFormState } from "react-dom";

async function action(prev, formData) {
  return { message: formData.get("nombre") };
}

export default function HookUseFormState() {
  const [state, formAction] = useFormState(action, { message: "" });

  return (
    <>
    <form action={formAction}>
      <input name="nombre" placeholder="Escribe tu nombre" />
      <button>Enviar</button>
      <p>Mensaje: {state.message}</p>
    </form>
           <a href="/">Ir a Home</a>
    </>
  );
}
