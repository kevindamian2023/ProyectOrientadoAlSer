import { addDoc, collection, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase.js";

class SessionManager {
  constructor() {
    this.sessionId = null;
    this.inicioSesion = null;
  }

  // Obtener el nombre del usuario actual
  obtenerNombreUsuario() {
    const user = auth.currentUser;
    if (user) {
      return user.displayName || user.email || "Usuario";
    }
    return "Usuario";
  }

  // Registrar inicio de sesión (SIN descripcion)
// En SessionManager.js
async registrarLogin(usuarioCustom = null) {
  try {
    const usuario = usuarioCustom || this.obtenerNombreUsuario();
    // Si ya hay una sesión activa en Firebase, no registrar de nuevo
    if (auth.currentUser && this.recuperarSesion()) {
      console.log("Ya hay una sesión activa, no se registra de nuevo.");
      return this.sessionId;
    }
    this.inicioSesion = new Date();
    const docRef = await addDoc(collection(db, "auditoria"), {
      accion: "login",
      tipo: "sesion",
      inicioSesion: serverTimestamp(),
      finSesion: null,
      fecha: serverTimestamp(),
      usuario: usuario,
    });
    this.sessionId = docRef.id;
    localStorage.setItem('sessionId', this.sessionId);
    localStorage.setItem('inicioSesion', this.inicioSesion.toISOString());
    localStorage.setItem('usuario', usuario);
    console.log("Sesión iniciada:", this.sessionId, "Usuario:", usuario);
    return this.sessionId;
  } catch (error) {
    console.error("Error al registrar login:", error);
  }
}


  // Registrar cierre de sesión (SIN descripcion)
  async registrarLogout() {
    try {
      const sessionId = this.sessionId || localStorage.getItem('sessionId');
      const inicioSesion = this.inicioSesion || new Date(localStorage.getItem('inicioSesion'));
      const usuario = localStorage.getItem('usuario') || this.obtenerNombreUsuario();
      if (!sessionId) {
        console.warn("No hay sesión activa para cerrar");
        return;
      }
      const finSesion = new Date();
      const tiempoActivo = finSesion - inicioSesion;
      const horas = Math.floor(tiempoActivo / (1000 * 60 * 60));
      const minutos = Math.floor((tiempoActivo % (1000 * 60 * 60)) / (1000 * 60));

      // Actualizar el documento de sesión (SIN descripcion)
      await updateDoc(doc(db, "auditoria", sessionId), {
        finSesion: serverTimestamp(),
      });

      // Limpiar datos locales
      localStorage.removeItem('sessionId');
      localStorage.removeItem('inicioSesion');
      localStorage.removeItem('usuario');
      this.sessionId = null;
      this.inicioSesion = null;
      console.log("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al registrar logout:", error);
    }
  }

  // Recuperar sesión si existe (por si recarga la página)
  recuperarSesion() {
    const sessionId = localStorage.getItem('sessionId');
    const inicioSesion = localStorage.getItem('inicioSesion');

    if (sessionId && inicioSesion) {
      this.sessionId = sessionId;
      this.inicioSesion = new Date(inicioSesion);
      console.log("Sesión recuperada:", this.sessionId);
      return true;
    }
    return false;
  }

  // Registrar actividad general (CRUD)
  async registrarActividad(accion, tipo, descripcion) {
    try {
      const usuario = localStorage.getItem('usuario') || this.obtenerNombreUsuario();

      await addDoc(collection(db, "auditoria"), {
        accion,
        tipo,
        descripcion,
        fecha: serverTimestamp(),
        usuario: usuario,
        inicioSesion: null,
        finSesion: null,
      });
    } catch (error) {
      console.error("Error al registrar actividad:", error);
    }
  }
}

export const sessionManager = new SessionManager();
