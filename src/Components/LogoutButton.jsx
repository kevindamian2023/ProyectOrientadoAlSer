import { signOut } from "firebase/auth";
import { auth } from "../firebase.js";
import { sessionManager } from "./SessionManager.js";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      // Registrar cierre de sesión en auditoría
      await sessionManager.registrarLogout();
      
      // Cerrar sesión en Firebase Auth
      await signOut(auth);
      navigate("/");
      console.log("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Error al cerrar sesión");
    }
  };

  return (
    <button
      className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
      onClick={handleLogout}
    >
      <i className="bi bi-box-arrow-right"></i>
      <span>Cerrar Sesión</span>
    </button>
  );
}



