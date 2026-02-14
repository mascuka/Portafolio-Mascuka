import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ADMIN_EMAIL, ADMIN_DETECTED_KEY, TIMEOUTS } from '../constants/config';

/**
 * CONTEXTO GLOBAL DE LA APLICACIÓN
 * Maneja el estado global: tema, idioma, autenticación
 */

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Estados globales
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState('ES');
  
  // Admin detection: true si alguna vez se logueó como admin
  const [isAdminDetected, setIsAdminDetected] = useState(() => {
    return localStorage.getItem(ADMIN_DETECTED_KEY) === 'true';
  });

  // isAdmin real: true solo si está logueado AHORA como admin
  const isAdmin = user?.email === ADMIN_EMAIL;

  // 🔐 MANEJO DE AUTENTICACIÓN
  useEffect(() => {
    let mounted = true;

    // Verificación inmediata del usuario actual
    const checkCurrentUser = () => {
      const currentUser = auth.currentUser;
      if (currentUser && mounted) {
        setUser(currentUser);
        setLoading(false);
        
        if (currentUser.email === ADMIN_EMAIL) {
          setIsAdminDetected(true);
          localStorage.setItem(ADMIN_DETECTED_KEY, 'true');
        }
      }
    };

    // Check inmediato
    checkCurrentUser();

    // Check retrasado (por si Firebase está inicializando)
    const timeoutCheck = setTimeout(checkCurrentUser, TIMEOUTS.authCheck);

    // Listener principal de auth
    const unsubscribe = onAuthStateChanged(auth, (newUser) => {
      if (!mounted) return;
      
      setUser(newUser);
      setLoading(false);
      
      if (newUser?.email === ADMIN_EMAIL) {
        setIsAdminDetected(true);
        localStorage.setItem(ADMIN_DETECTED_KEY, 'true');
      }
    });

    // Polling de respaldo (solo si no hay usuario después de 1 segundo)
    let pollCount = 0;
    const pollingInterval = setInterval(() => {
      if (!mounted || auth.currentUser || pollCount >= TIMEOUTS.authPollAttempts) {
        clearInterval(pollingInterval);
        if (mounted && !auth.currentUser) {
          setLoading(false);
        }
        return;
      }

      pollCount++;
      checkCurrentUser();
    }, TIMEOUTS.authPollInterval);

    return () => {
      mounted = false;
      clearTimeout(timeoutCheck);
      clearInterval(pollingInterval);
      unsubscribe();
    };
  }, []);

  // 🎨 SINCRONIZAR TEMA CON DOM
  useEffect(() => {
    document.body.classList.toggle('light', !isDark);
  }, [isDark]);

  // 📊 LOG DE DESARROLLO (solo en dev)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔄 AppContext:', {
        user: user?.email || 'null',
        isAdmin,
        isAdminDetected,
        loading
      });
    }
  }, [user, isAdmin, isAdminDetected, loading]);

  const value = {
    // Tema
    isDark,
    setIsDark,
    
    // Idioma
    lang,
    setLang,
    
    // Auth
    user,
    loading,
    isAdmin,
    isAdminDetected,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};