import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ⚠️ INSTRUCCIONES:
// 1. Ve a https://console.firebase.google.com/
// 2. Crea un proyecto nuevo (nombre: celulares-gonzalez)
// 3. Ve a "Configuración del proyecto" > "Tus apps" > Agrega una app web
// 4. Copia las credenciales y reemplaza los valores abajo
// 5. Ve a Firestore Database > Crear base de datos > Modo de prueba

const firebaseConfig = {
  apiKey: "AIzaSyDtg8pGHEtkRgC0ridEs8rXlv5p0OtAH60",
  authDomain: "celulares-gonzalez.firebaseapp.com",
  databaseURL: "https://celulares-gonzalez-default-rtdb.firebaseio.com",
  projectId: "celulares-gonzalez",
  storageBucket: "celulares-gonzalez.firebasestorage.app",
  messagingSenderId: "310365958030",
  appId: "1:310365958030:web:70ee648584d55bcb037edf",
  measurementId: "G-VLXBCD423Y"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
