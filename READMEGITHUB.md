# Autenticación con GitHub en Firebase

## Descripción
Este documento explica la configuración completa, requisitos e integración del método de autenticación con GitHub utilizando Firebase Authentication, incluyendo el manejo avanzado de casos donde el correo electrónico ya existe con otros proveedores.

## Requisitos Previos
- Proyecto creado en Firebase Console
- Aplicación React configurada
- Firebase SDK instalado
- **Cuenta de GitHub**
- **OAuth App registrada en GitHub**

## Configuración en GitHub

### Paso 1: Crear OAuth App en GitHub
1. Ir a [GitHub Settings](https://github.com/settings/developers)
2. Click en **OAuth Apps** → **New OAuth App**
3. Completar el formulario:
   - **Application name**: Nombre de tu aplicación
   - **Homepage URL**: `https://TU_PROJECT_ID.firebaseapp.com`
   - **Authorization callback URL**: (obtener de Firebase)
   
### Paso 2: Obtener Credenciales
1. Después de crear la app, copiar:
   - **Client ID**
   - **Client Secret** (generar si es necesario)
2. Guardar estas credenciales de forma segura

### Paso 3: Configuración de Privacidad del Email
**⚠️ IMPORTANTE**: GitHub puede no proporcionar el email si está privado.

Para que GitHub comparta tu email:
1. Ir a [GitHub Email Settings](https://github.com/settings/emails)
2. **Desmarcar**: "Keep my email addresses private"
3. O asegurarse de tener un email público en el perfil

## Configuración en Firebase Console

### Paso 1: Habilitar GitHub como Proveedor
1. Acceder a [Firebase Console](https://console.firebase.google.com/)
2. Seleccionar tu proyecto
3. Ir a **Authentication** → **Sign-in method**
4. Click en **GitHub**
5. Activar el interruptor **Enable**

### Paso 2: Configurar Credenciales
1. Pegar **Client ID** de GitHub
2. Pegar **Client Secret** de GitHub
3. Copiar la **Authorization callback URL** proporcionada por Firebase
4. Volver a GitHub OAuth App y pegar esta URL
5. Guardar cambios en Firebase

## Configuración en el Código

### 1. Inicialización de Firebase (`firebase.js`)
```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 2. Función para Obtener Email de GitHub API
```javascript
/**
 * Obtiene el email primario/verificado usando el token de GitHub
 * Intenta con /user y /user/emails
 */
async function getPrimaryEmailFromGithubToken(token) {
  if (!token) return null;
  
  const endpoints = ["/user", "/user/emails"];
  const authHeaders = [
    { Authorization: `token ${token}` },
    { Authorization: `Bearer ${token}` }
  ];

  for (const hdr of authHeaders) {
    for (const ep of endpoints) {
      const url = `https://api.github.com${ep}`;
      try {
        const resp = await fetch(url, {
          headers: {
            ...hdr,
            Accept: "application/vnd.github+json",
            "User-Agent": "Firebase-App",
          },
        });
        
        if (!resp.ok) continue;
        
        const body = await resp.json();
        
        if (ep === "/user" && body.email) {
          return body.email;
        } else if (ep === "/user/emails" && Array.isArray(body)) {
          const primary = body.find((e) => e.primary && e.verified);
          const verified = body.find((e) => e.verified);
          const pick = primary || verified || body[0];
          if (pick?.email) return pick.email;
        }
      } catch (err) {
        console.error("Error llamando a GitHub API:", err);
        continue;
      }
    }
  }
  return null;
}
```

### 3. Implementación Completa del Login con GitHub
```javascript
import { 
  signInWithPopup, 
  GithubAuthProvider,
  GoogleAuthProvider,
  FacebookAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential 
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const handleGithubLogin = async () => {
  const provider = new GithubAuthProvider();
  provider.addScope("user:email"); // Solicitar acceso al email

  try {
    // Login normal con GitHub
    const result = await signInWithPopup(auth, provider);
    
    // Guardar usuario en Firestore
    await setDoc(
      doc(db, "users", result.user.uid),
      {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        providers: ["github.com"],
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );

    alert("Inicio de sesión con GitHub exitoso ✅");
    navigate("/dashboard");
    
  } catch (error) {
    console.error("GitHub login error:", error);

    // CASO: correo existe con otro proveedor
    if (error.code === "auth/account-exists-with-different-credential") {
      const email = error.customData?.email;
      const pendingCred = GithubAuthProvider.credentialFromError(error);

      if (!email) {
        alert("GitHub no entregó el correo. Haz público tu email en GitHub → Settings → Emails.");
        return;
      }

      // Verificar qué métodos ya están asociados al correo
      const methods = await fetchSignInMethodsForEmail(auth, email);
      console.log("Métodos existentes:", methods);

      // 1️⃣ Cuenta existe con Google → enlazar automáticamente
      if (methods.includes("google.com")) {
        try {
          const googleProvider = new GoogleAuthProvider();
          const googleResult = await signInWithPopup(auth, googleProvider);
          
          // Enlazar GitHub a la cuenta de Google
          await linkWithCredential(googleResult.user, pendingCred);
          
          await setDoc(
            doc(db, "users", googleResult.user.uid),
            {
              providers: ["google.com", "github.com"],
              lastLogin: serverTimestamp(),
            },
            { merge: true }
          );

          alert("GitHub enlazado correctamente con tu cuenta de Google 🎉");
          navigate("/dashboard");
          return;
        } catch (linkError) {
          console.error("Error enlazando con Google:", linkError);
          alert("No se pudo enlazar con Google: " + linkError.message);
          return;
        }
      }

      // 2️⃣ Cuenta existe con Facebook → enlazar automáticamente
      if (methods.includes("facebook.com")) {
        try {
          const fbProvider = new FacebookAuthProvider();
          const fbResult = await signInWithPopup(auth, fbProvider);

          await linkWithCredential(fbResult.user, pendingCred);

          await setDoc(
            doc(db, "users", fbResult.user.uid),
            {
              providers: ["facebook.com", "github.com"],
              lastLogin: serverTimestamp(),
            },
            { merge: true }
          );

          alert("GitHub se enlazó a tu cuenta de Facebook 🎉");
          navigate("/dashboard");
          return;
        } catch (linkError) {
          console.error("Error enlazando con Facebook:", linkError);
          alert("No se pudo enlazar con Facebook: " + linkError.message);
          return;
        }
      }

      // 3️⃣ Existe con email/contraseña → instrucciones al usuario
      if (methods.includes("password")) {
        alert(
          "Este correo ya tiene email/contraseña. Inicia sesión con tu contraseña y luego enlaza GitHub desde tu perfil."
        );
        return;
      }

      alert("Este correo ya tiene otro método de inicio. No se pudo completar el login.");
      return;
    }

    // Cualquier otro error
    alert("Error: " + error.message);
  }
};
```

### 4. Botón en la Interfaz
```javascript
<Button 
  variant="outline-dark" 
  onClick={handleGithubLogin} 
  className="d-flex align-items-center justify-content-center flex-fill"
>
  GitHub
</Button>
```

### 5. Función para Enlazar GitHub desde Perfil (Opcional)
```javascript
const linkGithubToCurrentUser = async () => {
  if (!auth.currentUser) {
    alert("No hay usuario autenticado. Inicia sesión primero.");
    return;
  }
  
  const provider = new GithubAuthProvider();
  provider.addScope("user:email");
  
  try {
    await linkWithPopup(auth.currentUser, provider);
    
    await setDoc(
      doc(db, "users", auth.currentUser.uid),
      {
        providers: arrayUnion("github.com"),
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );
    
    alert("GitHub enlazado correctamente ✅");
  } catch (e) {
    console.error("Error linkWithPopup:", e);
    alert("No se pudo enlazar GitHub: " + e.message);
  }
};
```

## Integración en el Proyecto

### Flujo de Autenticación Normal
1. Usuario hace clic en "GitHub"
2. Se abre popup de autorización GitHub
3. Usuario autoriza la aplicación
4. GitHub retorna credenciales con token
5. Firebase valida y crea sesión
6. Se guarda usuario en Firestore
7. Redirección al Dashboard

### Flujo con Cuenta Existente
1. Usuario intenta login con GitHub
2. Error: `account-exists-with-different-credential`
3. Se extrae email del error o mediante GitHub API
4. Se consultan métodos existentes
5. **Si existe con Google**: popup Google → enlace automático
6. **Si existe con Facebook**: popup Facebook → enlace automático
7. **Si existe con password**: se informa al usuario
8. Usuario queda con múltiples proveedores enlazados

## Permisos y Scopes

### Scopes Básicos
```javascript
provider.addScope("user:email"); // Email del usuario
```

### Scopes Adicionales (Opcional)
```javascript
provider.addScope("read:user");     // Información de perfil
provider.addScope("user:follow");   // Seguidores/siguiendo
provider.addScope("repo");          // Acceso a repositorios
```

## Datos Obtenidos del Usuario
GitHub proporciona:
- `uid`: ID único generado por Firebase
- `displayName`: Nombre de usuario de GitHub
- `email`: Correo (si está público o se solicita scope)
- `photoURL`: Avatar de GitHub
- `providerId`: "github.com"
- Token de acceso (para llamadas a GitHub API)

## Manejo de Casos Especiales

### Email No Disponible
```javascript
if (!result.user.email) {
  // Intentar obtener desde GitHub API
  const credential = GithubAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;
  
  if (token) {
    const email = await getPrimaryEmailFromGithubToken(token);
    if (email) {
      console.log("Email obtenido desde API:", email);
    }
  }
}
```

### Múltiples Cuentas de GitHub
Un usuario puede tener varias cuentas de GitHub, pero solo una puede estar enlazada por correo electrónico.

### Revocar Acceso
El usuario puede revocar acceso desde:
- GitHub Settings → Applications → Authorized OAuth Apps

## Registro en Firebase Authentication
El usuario aparece en:
- **Firebase Console** → **Authentication** → **Users**
- Columna "Provider": muestra `github.com`
- Si está enlazado con otros proveedores, aparecen todos

## Errores Comunes y Soluciones

### Error: "Email Not Public"
**Causa**: Email privado en GitHub  
**Solución**: 
1. Ir a GitHub Settings → Emails
2. Desmarcar "Keep my email addresses private"
3. Alternativamente, usar GitHub API con scope `user:email`

### Error: "Redirect URI Mismatch"
**Causa**: URL de callback incorrecta  
**Solución**: Copiar exactamente la URL de Firebase Console a GitHub OAuth App

### Error: "account-exists-with-different-credential"
**Causa**: Email ya registrado con otro proveedor  
**Solución**: Implementado en el código con enlace automático

### Token Inválido al Consultar API
**Causa**: Token expirado o scope insuficiente  
**Solución**: Asegurar scope `user:email` y verificar token

## Consideraciones de Seguridad
- Nunca exponer Client Secret en código cliente
- Usar variables de entorno
- Validar tokens en servidor si es necesario
- HTTPS obligatorio en producción
- Implementar rate limiting para llamadas a GitHub API
- Configurar reglas de Firestore adecuadas

## Ventajas de GitHub Auth
✅ Popular entre desarrolladores  
✅ Acceso a información de repositorios  
✅ Token para integración con GitHub API  
✅ Sin necesidad de crear contraseña  
✅ Soporte para cuentas corporativas

## Capturas de Pantalla Requeridas
1. OAuth App configurada en GitHub Settings
2. Client ID y Client Secret en GitHub
3. Proveedor GitHub habilitado en Firebase Console
4. Usuario registrado con método `github.com` en Authentication
5. Usuario con múltiples proveedores enlazados (github.com + google.com)
6. Interfaz de login con botón GitHub
7. Popup de autorización de GitHub
8. Dashboard después de login exitoso
9. Colección "users" en Firestore mostrando providers: ["github.com"]
10. Consola del navegador mostrando logs de enlace exitoso

## Debugging
Agregar logs para debug:
```javascript
console.log("GitHub result:", result);
console.log("GitHub credential:", GithubAuthProvider.credentialFromResult(result));
console.log("User providers:", result.user.providerData);
```

## Recursos Adicionales
- [Documentación Firebase - GitHub Auth](https://firebase.google.com/docs/auth/web/github-auth)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [GitHub REST API - User Emails](https://docs.github.com/en/rest/users/emails)
- [Firebase - Link Multiple Auth Providers](https://firebase.google.com/docs/auth/web/account-linking)

## Notas Importantes
⚠️ GitHub puede no compartir el email si está configurado como privado  
⚠️ El enlace de cuentas requiere que el usuario autorice ambos proveedores  
⚠️ El token de GitHub tiene permisos limitados según los scopes solicitados  
⚠️ Algunos usuarios pueden tener organizaciones que bloqueen OAuth  
⚠️ Implementar manejo robusto de errores para todos los casos