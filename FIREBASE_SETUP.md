# 📱 Celulares González - Sistema de Gestión

## 🚀 Configuración de Firebase (Base de Datos en la Nube)

### Paso 1: Crear Proyecto en Firebase

1. Ve a https://console.firebase.google.com/
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Agregar proyecto"** o **"Add Project"**
4. Nombre del proyecto: `celulares-gonzalez` (o el que prefieras)
5. Puedes desactivar Google Analytics (opcional)
6. Haz clic en **"Crear proyecto"**

### Paso 2: Crear Base de Datos Firestore

1. En el menú lateral izquierdo, haz clic en **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de prueba"** (test mode)
4. Elige la ubicación más cercana (us-central1 o southamerica-east1)
5. Haz clic en **"Habilitar"**

### Paso 3: Registrar tu App Web

1. En la página principal del proyecto, busca el ícono de web (</>)
2. O ve a **Configuración del proyecto** > **Tus apps** > **Agregar app** > **Web**
3. Nombre del alias: `Celulares González Web`
4. **NO** marques "Configurar también Firebase Hosting"
5. Haz clic en **"Registrar app"**

### Paso 4: Copiar Configuración

Firebase te mostrará un objeto de configuración como este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "celulares-gonzalez.firebaseapp.com",
  projectId: "celulares-gonzalez",
  storageBucket: "celulares-gonzalez.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

**Copia todos estos valores.**

### Paso 5: Actualizar el Código

Abre el archivo `src/firebase.ts` y reemplaza los valores:

```typescript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",           // ← Pega tu apiKey
  authDomain: "TU_PROYECTO.firebaseapp.com",  // ← Pega tu authDomain
  projectId: "TU_PROYECTO",            // ← Pega tu projectId
  storageBucket: "TU_PROYECTO.appspot.com",   // ← Pega tu storageBucket
  messagingSenderId: "TU_SENDER_ID",   // ← Pega tu messagingSenderId
  appId: "TU_APP_ID"                   // ← Pega tu appId
};
```

### Paso 6: Configurar Reglas de Seguridad

1. Ve a **Firestore Database** > **Reglas**
2. Reemplaza las reglas con esto (para desarrollo):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Haz clic en **"Publicar"**

⚠️ **IMPORTANTE**: Estas reglas permiten acceso público. Para producción, deberías implementar autenticación.

### Paso 7: Probar la Conexión

1. Ejecuta tu aplicación: `npm run dev`
2. Abre la consola del navegador (F12)
3. Si ves errores de Firebase, revisa que copiaste bien las credenciales
4. Si todo está bien, los datos se sincronizarán automáticamente

## 📊 Estructura de Datos en Firestore

Firebase creará automáticamente estas colecciones:

- `devices` - Dispositivos del inventario
- `lots` - Lotes de importación
- `sales` - Ventas realizadas
- `qualityChecks` - Revisiones de calidad
- `checkSlots` - Slots para chequear dispositivos
- `customers` - Base de datos de clientes
- `repairs` - Reparaciones registradas
- `monthlyExpenses` - Gastos mensuales
- `monthlyGoals` - Metas mensuales
- `meta` - Metadatos (proveedores, revisores)

## 🔄 Migración de Datos Locales

Si ya tienes datos en localStorage (navegador local), puedes migrarlos a Firebase:

1. Abre la consola del navegador en tu app actual
2. Ejecuta este script para exportar tus datos:

```javascript
const data = {
  devices: JSON.parse(localStorage.getItem('iphone_tracker_devices') || '[]'),
  lots: JSON.parse(localStorage.getItem('iphone_tracker_lots') || '[]'),
  sales: JSON.parse(localStorage.getItem('iphone_tracker_sales') || '[]'),
  customers: JSON.parse(localStorage.getItem('iphone_tracker_customers') || '[]'),
  repairs: JSON.parse(localStorage.getItem('iphone_tracker_repairs') || '[]')
};
console.log(JSON.stringify(data));
```

3. Copia el JSON de la consola
4. Envíamelo y te ayudo a importarlo a Firebase

## 🌐 Publicar en Vercel

### Paso 1: Subir código a GitHub

```bash
git init
git add .
git commit -m "Versión con Firebase"
git remote add origin https://github.com/TU-USUARIO/celulares-gonzalez.git
git branch -M main
git push -u origin main
```

### Paso 2: Desplegar en Vercel

1. Ve a https://vercel.com
2. Inicia sesión con GitHub
3. Haz clic en **"Add New Project"**
4. Selecciona tu repositorio
5. Vercel detectará automáticamente que es Vite
6. Haz clic en **"Deploy"**
7. ¡Listo! Tendrás una URL como: `https://celulares-gonzalez.vercel.app`

### Paso 3: Configurar Variables de Entorno en Vercel

1. En Vercel, ve a tu proyecto > **Settings** > **Environment Variables**
2. Agrega estas variables (opcional, por seguridad):

```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
```

## 📱 Acceso desde Cualquier Dispositivo

Una vez publicado en Vercel:

✅ Abre la URL desde cualquier teléfono, tablet o computadora
✅ Los datos se sincronizan en tiempo real
✅ No necesitas instalar nada
✅ Solo necesitas internet

## 🔒 Seguridad (Para Producción)

Para hacer tu app más segura:

1. **Implementar Firebase Authentication**
   - Login con Google, email, etc.
   - Solo usuarios autorizados pueden acceder

2. **Actualizar reglas de Firestore**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. **Configurar dominios autorizados**
   - En Firebase > Authentication > Settings
   - Agrega tu dominio de Vercel

## 💡 Soporte

Si tienes problemas:
- Revisa la consola del navegador (F12) para ver errores
- Verifica que las credenciales de Firebase estén correctas
- Asegúrate de que Firestore esté habilitado
- Revisa las reglas de seguridad de Firestore

## 🎉 ¡Listo!

Tu aplicación ahora:
- ✅ Guarda datos en la nube
- ✅ Se sincroniza en tiempo real
- ✅ Accesible desde cualquier dispositivo
- ✅ Con copias de seguridad automáticas
- ✅ Sin límite de almacenamiento (plan gratuito de Firebase)
