import { useOptimistic, useState } from "react";

export default function HookUseOptimistic() {
  const [messages, setMessages] = useState([]);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(messages);

  const sendMessage = (msg) => {
    addOptimisticMessage([...messages, msg]);
    setTimeout(() => setMessages((prev) => [...prev, msg]), 1000);
  };

  return (
    <div>
      <h2>useOptimistic</h2>
      <button onClick={() => sendMessage("Nuevo mensaje")}>Enviar</button>
      <ul>
        {optimisticMessages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
       <a href="/">Ir a Home</a>
    </div>
  );
}
