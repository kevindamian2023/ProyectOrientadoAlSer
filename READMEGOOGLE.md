# Autenticación con Google en Firebase

## Descripción
Este documento explica la configuración, requisitos e integración del método de autenticación con Google utilizando Firebase Authentication en nuestra aplicación React.

## Requisitos Previos
- Proyecto creado en Firebase Console
- Aplicación React configurada
- Firebase SDK instalado (`npm install firebase`)
- Bootstrap y React Router instalados

## Configuración en Firebase Console

### Paso 1: Habilitar el Proveedor de Google
1. Acceder a [Firebase Console](https://console.firebase.google.com/)
2. Seleccionar tu proyecto
3. Ir a **Authentication** → **Sign-in method**
4. Hacer clic en **Google** en la lista de proveedores
5. Activar el interruptor **Enable**
6. Seleccionar un correo electrónico de soporte del proyecto
7. Hacer clic en **Save**

### Paso 2: Configuración Adicional (Opcional)
Para producción, puedes configurar:
- Dominios autorizados en la sección de configuración
- Personalización del consentimiento de OAuth
- Restricciones de dominios de correo permitidos

## Configuración en el Código

### 1. Inicialización de Firebase (`firebase.js`)
```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 2. Implementación del Login con Google
```javascript
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    
    // Guardar información del usuario en Firestore
    await setDoc(
      doc(db, "users", result.user.uid),
      {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        providers: ["google.com"],
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );
    
    alert("Inicio de sesión con Google exitoso ✅");
    navigate("/dashboard");
  } catch (error) {
    console.error("Google login error:", error);
    alert("Error: " + error.message);
  }
};
```

### 3. Botón en la Interfaz
```javascript
<Button 
  variant="outline-danger" 
  onClick={handleGoogleLogin} 
  className="d-flex align-items-center justify-content-center flex-fill"
>
  Google
</Button>
```

## Integración en el Proyecto

### Flujo de Autenticación
1. El usuario hace clic en el botón "Google"
2. Se abre una ventana emergente con el login de Google
3. El usuario selecciona su cuenta de Google
4. Firebase valida las credenciales
5. Se obtiene el token de autenticación
6. Se guarda la información del usuario en Firestore
7. Se redirige al Dashboard

### Manejo de Errores Común

#### Error: Cuenta existe con otro proveedor
```javascript
if (error?.code === "auth/account-exists-with-different-credential") {
  // Manejar enlace de cuentas
  const methods = await fetchSignInMethodsForEmail(auth, email);
  // Proceder con el enlace según el método existente
}
```

#### Error: Popup bloqueado
- Verificar que el navegador permita ventanas emergentes
- Considerar usar `signInWithRedirect` como alternativa

## Datos Obtenidos del Usuario
Al autenticarse con Google, Firebase proporciona:
- `uid`: ID único del usuario
- `displayName`: Nombre completo
- `email`: Correo electrónico
- `photoURL`: URL de la foto de perfil
- `emailVerified`: true (Google verifica automáticamente)

## Registro en Firebase Authentication
Una vez autenticado, el usuario aparece en:
- **Firebase Console** → **Authentication** → **Users**
- Columna "Provider": muestra `google.com`
- Información visible: Email, UID, fecha de creación

## Consideraciones de Seguridad
- Las credenciales de Firebase **nunca** deben exponerse en el código público
- Usar variables de entorno en producción
- Configurar reglas de seguridad en Firestore
- Validar dominios autorizados en Firebase Console

## Ventajas de Google Auth
✅ Proceso rápido y familiar para usuarios  
✅ No requiere crear contraseña  
✅ Email verificado automáticamente  
✅ Integración nativa con Firebase  
✅ Soporte para sesiones persistentes

## Capturas de Pantalla Requeridas
1. Configuración del proveedor Google en Firebase Console
2. Usuario registrado en la pestaña Authentication → Users
3. Método de acceso `google.com` visible en el perfil del usuario
4. Interfaz de login mostrando el botón de Google
5. Redirección exitosa al Dashboard después del login

## Recursos Adicionales
- [Documentación oficial de Firebase Auth](https://firebase.google.com/docs/auth)
- [Google Identity Platform](https://developers.google.com/identity)