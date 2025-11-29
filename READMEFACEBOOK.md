# Autenticación con Facebook en Firebase

## Descripción
Este documento detalla la configuración, requisitos e integración del método de autenticación con Facebook utilizando Firebase Authentication en nuestra aplicación React.

## Requisitos Previos
- Proyecto creado en Firebase Console
- Aplicación React configurada
- Firebase SDK instalado
- **Cuenta de desarrollador de Facebook**
- **Aplicación creada en Facebook Developers**

## Configuración en Facebook Developers

### Paso 1: Crear Aplicación en Facebook
1. Ir a [Facebook Developers](https://developers.facebook.com/)
2. Hacer clic en **My Apps** → **Create App**
3. Seleccionar tipo: **Consumer**
4. Completar información de la aplicación:
   - Nombre de la aplicación
   - Email de contacto
5. Hacer clic en **Create App**

### Paso 2: Configurar Facebook Login
1. En el dashboard de tu aplicación, agregar producto **Facebook Login**
2. Ir a **Facebook Login** → **Settings**
3. Agregar URLs válidas de redirección OAuth:
   ```
   https://TU_PROJECT_ID.firebaseapp.com/__/auth/handler
   ```
4. Guardar cambios

### Paso 3: Obtener Credenciales
1. Ir a **Settings** → **Basic**
2. Copiar:
   - **App ID** (ID de la aplicación)
   - **App Secret** (Clave secreta de la aplicación)

### Paso 4: Configurar Dominio
1. En **Settings** → **Basic**
2. Agregar dominio de la aplicación
3. Para desarrollo local: `localhost`

## Configuración en Firebase Console

### Paso 1: Habilitar Facebook como Proveedor
1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Seleccionar tu proyecto
3. **Authentication** → **Sign-in method**
4. Hacer clic en **Facebook**
5. Activar el interruptor **Enable**

### Paso 2: Agregar Credenciales de Facebook
1. Pegar **App ID** de Facebook
2. Pegar **App Secret** de Facebook
3. Copiar la URL de redirección OAuth proporcionada por Firebase
4. Pegar esta URL en Facebook Developers (paso realizado anteriormente)
5. Hacer clic en **Save**

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

### 2. Implementación del Login con Facebook
```javascript
import { signInWithPopup, FacebookAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const handleFacebookLogin = async () => {
  const provider = new FacebookAuthProvider();
  
  try {
    const result = await signInWithPopup(auth, provider);
    
    // Guardar usuario en Firestore
    await setDoc(
      doc(db, "users", result.user.uid),
      {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        providers: ["facebook.com"],
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );
    
    alert("Inicio de sesión con Facebook exitoso ✅");
    navigate("/dashboard");
  } catch (error) {
    console.error("Facebook login error:", error);
    
    if (error?.code === "auth/account-exists-with-different-credential") {
      // Manejar caso de cuenta existente
      alert("Esta cuenta ya existe con otro proveedor.");
    } else {
      alert("Error: " + error.message);
    }
  }
};
```

### 3. Botón en la Interfaz
```javascript
<Button 
  variant="outline-primary" 
  onClick={handleFacebookLogin} 
  className="d-flex align-items-center justify-content-center flex-fill"
>
  Facebook
</Button>
```

## Integración en el Proyecto

### Flujo de Autenticación
1. Usuario hace clic en botón "Facebook"
2. Se abre popup de Facebook Login
3. Usuario autoriza la aplicación
4. Facebook retorna credenciales
5. Firebase valida y crea sesión
6. Se guarda información en Firestore
7. Redirección al Dashboard

### Permisos Solicitados
Por defecto, Facebook Login solicita:
- **public_profile**: Información básica del perfil
- **email**: Correo electrónico del usuario

Para solicitar permisos adicionales:
```javascript
const provider = new FacebookAuthProvider();
provider.addScope('user_birthday');
provider.addScope('user_location');
```

## Manejo de Casos Especiales

### Enlace de Cuentas
Si el correo ya existe con otro proveedor:
```javascript
if (error.code === "auth/account-exists-with-different-credential") {
  const email = error.customData?.email;
  const methods = await fetchSignInMethodsForEmail(auth, email);
  
  if (methods.includes("google.com")) {
    // Iniciar sesión con Google primero
    const googleProvider = new GoogleAuthProvider();
    const googleResult = await signInWithPopup(auth, googleProvider);
    
    // Enlazar Facebook
    const pendingCred = FacebookAuthProvider.credentialFromError(error);
    await linkWithCredential(googleResult.user, pendingCred);
  }
}
```

### Usuario Sin Email Público
Algunos usuarios de Facebook no tienen email público. Manejar este caso:
```javascript
if (!result.user.email) {
  console.warn("Usuario de Facebook sin email público");
  // Solicitar email manualmente o usar UID como identificador
}
```

## Datos Obtenidos del Usuario
Facebook proporciona:
- `uid`: ID único generado por Firebase
- `displayName`: Nombre del usuario en Facebook
- `email`: Correo electrónico (si está disponible)
- `photoURL`: Foto de perfil
- `providerId`: "facebook.com"

## Registro en Firebase Authentication
El usuario aparece en:
- **Firebase Console** → **Authentication** → **Users**
- Columna "Provider": muestra `facebook.com`
- Se visualiza el método de acceso habilitado

## Configuración para Producción

### Modo de Desarrollo vs Producción
En Facebook Developers:
1. **Settings** → **Basic**
2. Cambiar de **Development** a **Live**
3. Completar Privacy Policy URL
4. Completar Terms of Service URL
5. Seleccionar categoría de la aplicación
6. Enviar para revisión si es necesario

### Dominios Autorizados
Agregar dominios de producción en:
- Firebase Console: Authentication → Settings → Authorized domains
- Facebook Developers: Settings → Basic → App Domains

## Errores Comunes y Soluciones

### Error: "App Not Set Up"
**Causa**: App ID o App Secret incorrectos  
**Solución**: Verificar credenciales en Firebase Console

### Error: "URL Blocked"
**Causa**: URL de redirección no autorizada  
**Solución**: Agregar URL en Facebook OAuth Redirect URIs

### Error: "This app is in development mode"
**Causa**: App de Facebook no está en modo Live  
**Solución**: Cambiar a Live en Facebook Developers

### Popup Bloqueado
**Causa**: Navegador bloqueó ventana emergente  
**Solución**: Usar `signInWithRedirect` o permitir popups

## Consideraciones de Seguridad
- Nunca exponer App Secret en código cliente
- Usar variables de entorno
- Implementar App Check de Firebase
- Configurar reglas de Firestore adecuadas
- HTTPS obligatorio en producción

## Ventajas de Facebook Auth
✅ Gran base de usuarios existentes  
✅ Proceso rápido sin creación de contraseña  
✅ Acceso a información adicional del perfil  
✅ Integración nativa con Firebase  
✅ Soporte multiplataforma

## Capturas de Pantalla Requeridas
1. Configuración de Facebook Login en Facebook Developers
2. App ID y App Secret en Facebook Developers
3. Proveedor Facebook habilitado en Firebase Console
4. Usuario registrado con método `facebook.com` en Authentication
5. Interfaz de login con botón de Facebook
6. Dashboard después de autenticación exitosa
7. Colección "users" en Firestore con provider "facebook.com"

## Recursos Adicionales
- [Documentación Firebase - Facebook Auth](https://firebase.google.com/docs/auth/web/facebook-login)
- [Facebook Login - Guía de inicio rápido](https://developers.facebook.com/docs/facebook-login/web)
- [Permisos de Facebook](https://developers.facebook.com/docs/permissions/reference)

## Notas Importantes
⚠️ Facebook requiere revisión para ciertos permisos avanzados  
⚠️ La aplicación debe estar en modo "Live" para usuarios externos  
⚠️ Algunos usuarios pueden tener email no disponible  
⚠️ Actualizar URLs cuando se cambie de desarrollo a producción