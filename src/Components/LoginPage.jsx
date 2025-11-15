import { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase"; // Mantén tu inicialización de firebase
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  linkWithPopup,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Guarda/actualiza usuario en Firestore (providers como array)
 */
async function saveUserRecord(user) {
  if (!user) return;
  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        providers: (user.providerData || []).map((p) => p.providerId),
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.error("Error guardando usuario:", e);
  }
}

/**
 * Intenta obtener el email primario/verificado usando el token de GitHub.
 * - Prueba /user (que puede incluir "email")
 * - Prueba /user/emails (lista de emails)
 * - Prueba encabezados Authorization como "token" y "Bearer"
 * Devuelve string email o null. Imprime logs detallados para depuración.
 */
async function getPrimaryEmailFromGithubToken(token) {
  if (!token) return null;
  const endpoints = ["/user", "/user/emails"];
  const authHeaders = [
    { Authorization: `token ${token}` }, // formato clásico
    { Authorization: `Bearer ${token}` }, // formato moderno
  ];

  for (const hdr of authHeaders) {
    for (const ep of endpoints) {
      const url = `https://api.github.com${ep}`;
      try {
        console.log(`[GitHub API] Petición a ${url} con header:`, hdr);
        const resp = await fetch(url, {
          headers: {
            ...hdr,
            Accept: "application/vnd.github+json",
            "User-Agent": "Firebase-App",
          },
        });
        console.log(`[GitHub API] ${url} status:`, resp.status);
        let body;
        try {
          body = await resp.json();
        } catch (e) {
          console.warn(`[GitHub API] No JSON en respuesta de ${url}`, e);
          body = null;
        }
        console.log(`[GitHub API] ${url} body:`, body);

        if (!resp.ok) {
          // 401/403 suele indicar permisos insuficientes o token inválido
          console.warn(`[GitHub API] Respuesta no OK ${resp.status} para ${url}`);
          continue;
        }

        if (ep === "/user") {
          // user puede contener "email" si GitHub decidió devolverlo
          if (body && body.email) {
            console.log("[GitHub API] Email en /user:", body.email);
            return body.email;
          }
          // si no trae email, seguir a /user/emails
        } else if (ep === "/user/emails") {
          if (!Array.isArray(body)) {
            console.warn("[GitHub API] /user/emails no devolvió array:", body);
            continue;
          }
          // Priorizar primary && verified, luego verified, luego cualquiera
          const primary = body.find((e) => e.primary && e.verified);
          const verified = body.find((e) => e.verified);
          const pick = primary || verified || body[0];
          if (pick && pick.email) {
            console.log("[GitHub API] Email elegido desde /user/emails:", pick);
            return pick.email;
          }
        }
      } catch (err) {
        console.error("[GitHub API] Error llamando a", url, err);
        continue;
      }
    }
  }
  console.log("[GitHub API] No se pudo obtener email con el token provisto.");
  return null;
}

/**
 * Maneja auth/account-exists-with-different-credential:
 * - intenta obtener email desde error o desde pending credential (token)
 * - consulta fetchSignInMethodsForEmail
 * - si es google.com -> abre popup google y linkea la pending credential
 * - si es password -> informa que el usuario debe iniciar con password y luego enlazar
 */
async function handleAccountExistsWithDifferentCredential(error) {
  console.warn("account-exists-with-different-credential:", error);

  // extrae la credential pendiente (si existe)
  const pendingCred =
    GithubAuthProvider.credentialFromError?.(error) ||
    GoogleAuthProvider.credentialFromError?.(error) ||
    null;

  // intenta obtener email del error
  let emailFromError = error?.customData?.email || error?.email || null;
  console.log("emailFromError inicial:", emailFromError);

  // si no hay email, intenta extraer token de la pending cred y pedirlo a la API de GitHub
  if (!emailFromError && pendingCred) {
    const token =
      pendingCred?.accessToken || pendingCred?.oauthAccessToken || pendingCred?.access_token || null;
    console.log("pendingCred token:", !!token ? "presente" : "ausente");
    if (token) {
      const fetched = await getPrimaryEmailFromGithubToken(token);
      if (fetched) {
        emailFromError = fetched;
        console.log("Email obtenido desde GitHub API usando token:", emailFromError);
      } else {
        console.log("No se pudo obtener email desde GitHub API con el token.");
      }
    } else {
      console.log("pendingCred no incluye token:", pendingCred);
    }
  }

  if (!emailFromError) {
    // No se puede automatizar sin email: informar al usuario sobre la acción a tomar
    throw new Error(
      "No se pudo obtener el correo desde GitHub. Pide al usuario iniciar sesión primero con su proveedor original (ej. Google) y luego enlazar GitHub desde su perfil."
    );
  }

  // obtenemos métodos existentes para ese email
  const methods = await fetchSignInMethodsForEmail(auth, emailFromError);
  console.log("Métodos existentes para", emailFromError, methods);

  if (!methods || methods.length === 0) {
    throw new Error(
      "No se encontraron métodos existentes para este email. Pide al usuario iniciar sesión con su proveedor original y luego enlazar la cuenta."
    );
  }

  // si existe con google.com -> abrimos popup Google y linkeamos la credential pendiente
  if (methods.includes("google.com")) {
    const googleProvider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, googleProvider);
    if (pendingCred) {
      try {
        await linkWithCredential(result.user, pendingCred);
      } catch (e) {
        console.error("Error linkWithCredential:", e);
        throw e;
      }
    }
    await saveUserRecord(result.user);
    return result.user;
  }

  // si existe con github.com -> pedir popup GitHub y linkear (caso raro)
  if (methods.includes("github.com")) {
    const githubProvider = new GithubAuthProvider();
    githubProvider.addScope("user:email");
    const result = await signInWithPopup(auth, githubProvider);
    if (pendingCred) {
      await linkWithCredential(result.user, pendingCred);
    }
    await saveUserRecord(result.user);
    return result.user;
  }

  // si existe con password -> UX: pedir al usuario su contraseña y hacer sign in con email/password para luego linkear
  if (methods.includes("password")) {
    throw new Error(
      "La cuenta existe con email/contraseña. Pide al usuario iniciar sesión con su contraseña y luego enlaza GitHub desde su perfil."
    );
  }

  throw new Error("Método de inicio existente no soportado: " + methods.join(", "));
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await saveUserRecord(auth.currentUser);
      alert("Inicio de sesión exitoso ✅");
      navigate("/dashboard");
    } catch (error) {
      console.error("Email/password login error:", error);
      alert("Error: " + (error.message || error.code || error));
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await saveUserRecord(result.user);
      alert("Inicio de sesión con Google exitoso ✅");
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
      if (error?.code === "auth/account-exists-with-different-credential") {
        try {
          await handleAccountExistsWithDifferentCredential(error);
          alert("Cuentas enlazadas correctamente. Ya puedes entrar con Google o GitHub.");
          navigate("/dashboard");
        } catch (e) {
          console.error("No se pudo auto-enlazar:", e);
          alert(e.message || "No se pudo enlazar automáticamente. Inicia sesión con el proveedor original y luego enlaza desde el perfil.");
        }
      } else {
        alert("Error: " + (error.message || error.code || error));
      }
    }
  };

const handleGithubLogin = async () => {
  const provider = new GithubAuthProvider();
  provider.addScope("user:email");

  try {
    // Login normal con GitHub
    const result = await signInWithPopup(auth, provider);
    await saveUserRecord(result.user);

    alert("Inicio de sesión con GitHub exitoso ✅");
    navigate("/dashboard");
  } catch (error) {
    console.error("GitHub login error:", error);

    // --- CASO CLAVE: correo existe con otro proveedor ---
    if (error.code === "auth/account-exists-with-different-credential") {
      const email = error.customData?.email;
      const pendingCred = GithubAuthProvider.credentialFromError(error);

      if (!email) {
        alert("GitHub no entregó el correo. Haz público tu email en GitHub → Settings → Emails.");
        return;
      }

      // Ver qué métodos YA están asociados al correo
      const methods = await fetchSignInMethodsForEmail(auth, email);
      console.log("Métodos existentes:", methods);

      // 1️⃣ Cuenta existe con Google → enlazar
      if (methods.includes("google.com")) {
        const googleProvider = new GoogleAuthProvider();
        const googleResult = await signInWithPopup(auth, googleProvider);

        // Enlazar GitHub a la cuenta de Google
        await linkWithCredential(googleResult.user, pendingCred);

        await saveUserRecord(googleResult.user);
        alert("GitHub enlazado correctamente con tu cuenta de Google 🎉");
        navigate("/dashboard");
        return;
      }

      // 2️⃣ Cuenta existe con Facebook → enlazar
      if (methods.includes("facebook.com")) {
        const fbProvider = new FacebookAuthProvider();
        const fbResult = await signInWithPopup(auth, fbProvider);

        await linkWithCredential(fbResult.user, pendingCred);

        await saveUserRecord(fbResult.user);
        alert("GitHub se enlazó a tu cuenta de Facebook 🎉");
        navigate("/dashboard");
        return;
      }

      // 3️⃣ Existe con email/contraseña → pedir login normal primero
      if (methods.includes("password")) {
        alert(
          "Este correo ya tiene email/contraseña. Inicia sesión con tu contraseña y luego enlaza GitHub desde tu perfil."
        );
        return;
      }

      alert("Este correo ya tiene otro método de inicio. No se pudo completar el login.");
      return;
    }

    // --- Cualquier otro error ---
    alert("Error: " + error.message);
  }
};






  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await saveUserRecord(result.user);
      alert("Inicio de sesión con Facebook exitoso ✅");
      navigate("/dashboard");
    } catch (error) {
      console.error("Facebook login error:", error);
      if (error?.code === "auth/account-exists-with-different-credential") {
        try {
          await handleAccountExistsWithDifferentCredential(error);
          alert("Cuentas enlazadas correctamente.");
          navigate("/dashboard");
        } catch (e) {
          console.error(e);
          alert(e.message || "Error al intentar enlazar cuentas.");
        }
      } else {
        alert("Error: " + (error.message || error.code || error));
      }
    }
  };

  // Función utilitaria que puedes usar en la página de perfil para enlazar GitHub cuando el usuario ya esté autenticado
  // (recomendado: mejor UX y evita problemas de merge automático)
  const linkGithubToCurrentUser = async () => {
    if (!auth.currentUser) {
      alert("No hay usuario autenticado. Inicia sesión primero.");
      return;
    }
    const provider = new GithubAuthProvider();
    provider.addScope("user:email");
    try {
      const result = await linkWithPopup(auth.currentUser, provider);
      await saveUserRecord(auth.currentUser);
      alert("GitHub enlazado correctamente ✅");
    } catch (e) {
      console.error("Error linkWithPopup:", e);
      alert("No se pudo enlazar GitHub: " + (e.message || e.code || e));
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card style={{ width: "28rem" }} className="shadow-lg border-0 rounded-4">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Iniciar Sesión</h2>
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

          <div className="d-flex justify-content-between mt-3 gap-2">
            <Button variant="outline-danger" onClick={handleGoogleLogin} className="d-flex align-items-center justify-content-center flex-fill">
              Google
            </Button>

            <Button variant="outline-primary" onClick={handleFacebookLogin} className="d-flex align-items-center justify-content-center flex-fill">
              Facebook
            </Button>

            <Button variant="outline-dark" onClick={handleGithubLogin} className="d-flex align-items-center justify-content-center flex-fill">
              GitHub
            </Button>
          </div>

          <div className="d-flex justify-content-between mt-3 mb-3 ">
            <Link to="/register">¿No tienes cuenta? Regístrate</Link>
            <Link to="/reset-password">¿Olvidaste tu contraseña?</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default LoginPage;