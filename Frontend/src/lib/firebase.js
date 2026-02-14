import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { FIREBASE_CONFIG } from '../constants/config';

/**
 * INICIALIZACIÓN DE FIREBASE
 * Configuración centralizada y persistencia habilitada
 */

// Inicializar Firebase
const app = initializeApp(FIREBASE_CONFIG);

// Configurar Auth con persistencia
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// Configurar Firestore
export const db = getFirestore(app);

// Proveedores de autenticación
export const googleProvider = new GoogleAuthProvider();

// Configurar el provider para forzar selección de cuenta
googleProvider.setCustomParameters({
  prompt: 'select_account'
});