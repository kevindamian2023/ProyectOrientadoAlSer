import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Sesión cerrada exitosamente 👋");
      navigate("/login");
    } catch (error) {
      alert("Error al cerrar sesión: " + error.message);
    }
  };

  return (
    <Button variant="danger" onClick={handleLogout}>
      Cerrar Sesión
    </Button>
  );
}

export default LogoutButton;