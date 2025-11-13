import { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithPopup
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 🔹 Guarda/actualiza registro del usuario en Firestore
  const saveUserRecord = async (user, provider) => {
    if (!user) return;
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          displayName: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
          provider,
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error("Error guardando usuario:", e);
    }
  };

  // 🔹 Inicio de sesión con correo y contraseña
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await saveUserRecord(auth.currentUser, "password");
      alert("Inicio de sesión exitoso ✅");
      navigate("/dashboard");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  // 🔹 Función general para login con proveedores
  const handleProviderLogin = async (provider, providerName) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Guardar/actualizar datos del usuario
      await saveUserRecord(user, providerName);

      alert(`Inicio de sesión con ${providerName} exitoso ✅`);
      navigate("/dashboard");
    } catch (error) {
      // 🔹 Si el correo ya existe con otro método
      if (error.code === "auth/account-exists-with-different-credential") {
        const pendingCred = error.credential;
        const email = error.customData.email;

        const methods = await fetchSignInMethodsForEmail(auth, email);

        if (methods.includes("password")) {
          alert(`Ya existe una cuenta con ${email}. Inicia sesión con correo y contraseña para vincular ${providerName}.`);
        } else if (methods.length > 0) {
          // Detecta el proveedor existente
          const existingProvider =
            methods.includes("google.com") ? new GoogleAuthProvider() :
            methods.includes("github.com") ? new GithubAuthProvider() :
            methods.includes("facebook.com") ? new FacebookAuthProvider() :
            null;

          if (existingProvider) {
            const existingResult = await signInWithPopup(auth, existingProvider);
            // Vincula el nuevo proveedor
            await linkWithPopup(existingResult.user, provider);
            await saveUserRecord(existingResult.user, providerName);

            alert(`Se vinculó ${providerName} a tu cuenta existente ✅`);
            navigate("/dashboard");
          }
        }
      } else {
        console.error(error);
        alert("Error: " + error.message);
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card style={{ width: "28rem" }} className="shadow-lg border-0 rounded-4">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Iniciar Sesión</h2>

          {/* 🔹 Formulario de login tradicional */}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit">
                Iniciar Sesión
              </Button>
            </div>
          </Form>

          {/* 🔹 Botones de login con proveedores */}
          <div className="d-flex justify-content-between mt-3 gap-2">
            {/* Google */}
            <Button
              variant="outline-danger"
              onClick={() => handleProviderLogin(new GoogleAuthProvider(), "Google")}
              className="d-flex align-items-center justify-content-center flex-fill"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" className="me-2">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8
                c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
                C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
                c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20
                C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819
                C14.655,15.108,18.961,12,24,12
                c3.059,0,5.842,1.154,7.961,3.039
                l5.657-5.657C34.046,6.053,29.268,4,24,4
                C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44
                c5.166,0,9.86-1.977,13.409-5.192
                l-6.19-5.238C29.211,35.091,26.715,36,24,36
                c-5.202,0-9.619-3.317-11.283-7.946
                l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303
                c-0.792,2.237-2.231,4.166-4.087,5.571
                l6.19,5.238C36.971,39.205,44,34,44,24
                C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              Google
            </Button>

            {/* Facebook */}
            <Button
              variant="outline-primary"
              onClick={() => handleProviderLogin(new FacebookAuthProvider(), "Facebook")}
              className="d-flex align-items-center justify-content-center flex-fill"
            >
              <i className="bi bi-facebook me-2"></i>
              Facebook
            </Button>

            {/* GitHub */}
            <Button
              variant="outline-dark"
              onClick={() => handleProviderLogin(new GithubAuthProvider(), "GitHub")}
              className="d-flex align-items-center justify-content-center flex-fill"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                className="bi bi-github me-2"
                viewBox="0 0 16 16"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 
                7.59c.4.07.55-.17.55-.38 
                0-.19-.01-.82-.01-1.49
                -2.01.37-2.53-.49-2.69-.94
                -.09-.23-.48-.94-.82-1.13
                -.28-.15-.68-.52-.01-.53
                .63-.01 1.08.58 1.23.82
                .72 1.21 1.87.87 2.33.66
                .07-.52.28-.87.51-1.07
                -1.78-.2-3.64-.89-3.64-3.95
                0-.87.31-1.59.82-2.15
                -.08-.2-.36-1.02.08-2.12
                0 0 .67-.21 2.2.82a7.55 
                7.55 0 0 1 2-.27
                c.68 0 1.36.09 2 .27
                1.53-1.04 2.2-.82 2.2-.82
                .44 1.1.16 1.92.08 2.12
                .51.56.82 1.27.82 2.15
                0 3.07-1.87 3.75-3.65 3.95
                .29.25.54.73.54 1.48
                0 1.07-.01 1.93-.01 2.19
                0 .21.15.46.55.38A8.001 
                8.001 0 0 0 16 8
                c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </Button>
          </div>

          <div className="d-flex justify-content-between mt-3 mb-3">
            <Link to="/register">¿No tienes cuenta? Regístrate</Link>
            <Link to="/reset-password">¿Olvidaste tu contraseña?</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default LoginPage;
