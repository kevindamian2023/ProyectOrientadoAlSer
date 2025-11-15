import { useState } from "react";
import { auth, GoogleProvider, providerFacebook, providerGitHub, db } from "../firebase";
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import { linkWithPopup, signOut } from "firebase/auth";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";


export default function Topbar({ user, onMenuClick }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const isProviderLinked = (providerId) =>
    auth.currentUser?.providerData.some((p) => p.providerId === providerId);

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem("currentSessionId");

      if (sessionId) {
        const sessionRef = doc(db, "sessions", sessionId);
        const sessionSnap = await getDoc(sessionRef);
        if (sessionSnap.exists()) {
          const sessionData = sessionSnap.data();
          const loginTime = sessionData.loginTime?.toDate();
          const logoutTime = new Date();
          const duration = loginTime ? Math.floor((logoutTime - loginTime) / 1000) : 0;

          await updateDoc(sessionRef, {
            logoutTime: serverTimestamp(),
            duration,
            isActive: false,
          });
        }
      }

      if (auth.currentUser) {
        await setDoc(
          doc(db, "users", auth.currentUser.uid),
          { isOnline: false, lastLogout: serverTimestamp() },
          { merge: true }
        );
      }

      localStorage.removeItem("currentSessionId");
      await signOut(auth);
      navigate("/login");

      Swal.fire("Sesión cerrada", "Has cerrado sesión exitosamente", "success");
    } catch {
      Swal.fire("Error", "No se pudo cerrar sesión", "error");
    }
  };

  const handleLinkAccount = async (provider) => {
    let prov =
      provider === "google"
        ? GoogleProvider
        : provider === "facebook"
        ? providerFacebook
        : providerGitHub;

    try {
      await linkWithPopup(auth.currentUser, prov);
      Swal.fire("Cuenta vinculada correctamente!", "", "success");
    } catch (error) {
      if (error.code === "auth/provider-already-linked") {
        Swal.fire("Error", "Ya tienes este proveedor vinculado", "error");
      } else if (error.code === "auth/account-exists-with-different-credential") {
        Swal.fire("Advertencia", "Debes iniciar con ese proveedor primero", "info");
      } else {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  return (
    <nav className="navbar navbar-light bg-white shadow-sm px-3 sticky-top">
      <div className="d-flex align-items-center gap-3">

        {/* Botón menú */}
        <button className="btn btn-outline-primary d-md-none" onClick={onMenuClick}>
          <Icon icon="mdi:menu" width="24" />
        </button>

        <div className="d-flex flex-column">
          <span className="fw-bold fs-5">Sistema de Trámites</span>
          <small className="text-muted d-none d-sm-block">Gobierno Municipal</small>
        </div>
      </div>

      {/* Usuario */}
      <div className="dropdown">
        <button
          className="btn btn-light d-flex align-items-center gap-2 dropdown-toggle"
          data-bs-toggle="dropdown"
        >
          <Icon icon="mdi:account" width="22" />
          <span className="fw-semibold">{user?.displayName ?? "Usuario"}</span>
        </button>

        <ul className="dropdown-menu dropdown-menu-end shadow">

          {!isProviderLinked("google.com") && (
            <li>
              <button className="dropdown-item" onClick={() => handleLinkAccount("google")}>
                <Icon icon="logos:google-icon" width="20" className="me-2" />
                Vincular con Google
              </button>
            </li>
          )}

          {!isProviderLinked("facebook.com") && (
            <li>
              <button className="dropdown-item" onClick={() => handleLinkAccount("facebook")}>
                <Icon icon="logos:facebook" width="20" className="me-2" />
                Vincular con Facebook
              </button>
            </li>
          )}

          {!isProviderLinked("github.com") && (
            <li>
              <button className="dropdown-item" onClick={() => handleLinkAccount("github")}>
                <Icon icon="mdi:github" width="20" className="me-2" />
                Vincular con GitHub
              </button>
            </li>
          )}

          <li>
            <hr className="dropdown-divider" />
          </li>

          <li>
            <button className="dropdown-item text-danger" onClick={handleLogout}>
              <Icon icon="mdi:logout" width="20" className="me-2" />
              Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
