import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import "./Navbar.css";

export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <nav className="navbar-custom">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <span className="brand-icon">🏪</span>
                    <span className="brand-text">Mi Tienda</span>
                </div>

                <div className="navbar-actions">
                    <button
                        className="btn-admin"
                        onClick={() => navigate("/dashboard")}
                    >
                        <span className="btn-icon">⚙️</span>
                        Administrador
                    </button>
                    <button
                        className="btn-logout"
                        onClick={handleLogout}
                    >
                        <span className="btn-icon">🚪</span>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </nav>
    );
}
