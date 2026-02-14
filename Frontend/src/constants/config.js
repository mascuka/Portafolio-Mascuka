/**
 * CONFIGURACIÓN GLOBAL DE LA APLICACIÓN
 * Variables de entorno y constantes de configuración
 */

// Admin
export const ADMIN_EMAIL = "mascuka410@gmail.com";
export const ADMIN_DETECTED_KEY = 'portfolio_admin_detected';

// Cloudinary
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  folders: {
    portfolio: 'portfolio',
    cv: 'cv_files',
    projects: 'projects',
  },
  limits: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxVideoSize: 50 * 1024 * 1024, // 50MB
  }
};

// Firebase
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Idiomas disponibles
export const LANGUAGES = {
  ES: 'ES',
  EN: 'EN',
};

// Timeouts y delays
export const TIMEOUTS = {
  authCheck: 500,
  authPollInterval: 2000,
  authPollAttempts: 5,
  toastDuration: 3000,
};