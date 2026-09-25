# 📱 Celulares González - Sistema de Gestión

Sistema completo para gestión de inventario, ventas, reparaciones y clientes con sincronización en la nube.

## 🚀 Características

- ✅ **Inventario completo** de dispositivos iPhone
- ✅ **Gestión de lotes** con múltiples modelos y precios
- ✅ **Control de calidad** con 10 pruebas por dispositivo
- ✅ **Sistema de ventas** con pólizas de garantía
- ✅ **Reparaciones** con seguimiento de estado
- ✅ **Base de datos de clientes** con historial
- ✅ **Análisis financiero** con metas mensuales
- ✅ **Sincronización en la nube** con Firebase
- ✅ **Acceso desde cualquier dispositivo**
- ✅ **PDF de pólizas** optimizado y elegante

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build
```

## 🔥 Configuración de Firebase (Base de Datos en la Nube)

### Paso 1: Crear Proyecto en Firebase

1. Ve a https://console.firebase.google.com/
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Agregar proyecto"**
4. Nombre: `celulares-gonzalez`
5. Puedes desactivar Google Analytics
6. Haz clic en **"Crear proyecto"**

### Paso 2: Crear Base de Datos Firestore

1. En el menú lateral, haz clic en **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de prueba"**
4. Elige ubicación: `us-central1` o `southamerica-east1`
5. Haz clic en **"Habilitar"**

### Paso 3: Registrar Aplicación Web

1. En la página principal, busca el ícono web **(&lt;/&gt;)**
2. Nombre del alias: `Celulares González Web`
3. **NO** marques "Configurar también Firebase Hosting"
4. Haz clic en **"Registrar app"**

### Paso 4: Copiar Configuración

Firebase te mostrará un objeto como este:

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

### Paso 5: Actualizar tu Código

Abre `src/firebase.ts` y reemplaza los valores:

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

En Firestore Database > **Reglas**, reemplaza con:

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

Haz clic en **"Publicar"**

### Paso 7: Migrar Datos Locales (Opcional)

Si ya tienes datos en tu navegador:

1. Abre tu aplicación: `http://localhost:3000`
2. Ve a: `http://localhost:3000/firebase-setup`
3. Haz clic en **"Migrar Datos a Firebase"**
4. Confirma la migración
5. Opcionalmente, limpia los datos locales

## 🌐 Publicar en Vercel (Acceso desde Cualquier Dispositivo)

### Paso 1: Subir Código a GitHub

```bash
# Inicializar git
git init

# Agregar archivos
git add .

# Primer commit
git commit -m "Versión con Firebase"

# Conectar con GitHub (reemplaza TU-USUARIO)
git remote add origin https://github.com/TU-USUARIO/celulares-gonzalez.git

# Subir código
git branch -M main
git push -u origin main
```

### Paso 2: Desplegar en Vercel

1. Ve a https://vercel.com
2. Inicia sesión con GitHub
3. Haz clic en **"Import Project"**
4. Selecciona tu repositorio `celulares-gonzalez`
5. Haz clic en **"Deploy"**
6. Espera 1-2 minutos

Vercel te dará una URL como: `https://celulares-gonzalez.vercel.app`

### Paso 3: ¡Listo! 🎉

Ahora puedes:
- ✅ Abrir tu sitio desde cualquier teléfono, tablet o computadora
- ✅ Los datos se sincronizan en tiempo real
- ✅ No necesitas instalar nada
- ✅ Solo necesitas internet

## 📊 Estructura de Datos

Firebase creará estas colecciones automáticamente:

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

## 🔄 Actualizaciones

Cuando hagas cambios y quieras publicarlos:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

Vercel actualizará automáticamente tu sitio en 1-2 minutos.

## 💡 Plan Gratuito de Firebase

El plan gratuito (Spark) incluye:
- ✅ 1 GB de almacenamiento
- ✅ 50,000 lecturas por día
- ✅ 20,000 escrituras por día
- ✅ Suficiente para uso personal o pequeño negocio

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

## 📱 Guías Adicionales

- **Guía visual de Firebase**: Abre `public/firebase-setup-guide.html` en tu navegador
- **Documentación completa**: Lee `FIREBASE_SETUP.md`

## 🛠️ Tecnologías

- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool rápido
- **Tailwind CSS** - Estilos utilitarios
- **Firebase** - Base de datos en la nube
- **Recharts** - Gráficas interactivas
- **jsPDF** - Generación de PDFs

## 📞 Soporte

Si tienes problemas:
- Abre la consola del navegador (F12) para ver errores
- Verifica que las credenciales de Firebase estén correctas
- Asegúrate de que Firestore esté habilitado
- Revisa las reglas de seguridad de Firestore

## 🎉 ¡Listo!

Tu aplicación ahora:
- ✅ Guarda datos en la nube
- ✅ Se sincroniza en tiempo real
- ✅ Es accesible desde cualquier dispositivo
- ✅ Tiene copias de seguridad automáticas
- ✅ Sin límite de almacenamiento (plan gratuito)

---

**Desarrollado para Celulares González** 📱
