import { useState, useEffect } from 'react';
import { AppContext } from './context';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ADMIN_EMAIL, ADMIN_DETECTED_KEY, TIMEOUTS } from '../constants/config';
import { COLORS } from '../constants/colors'; // ← NUEVO: Para inyección dinámica

/**
 * CONTEXTO GLOBAL DE LA APLICACIÓN
 * Maneja el estado global: tema, idioma, autenticación
 */

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

  // 🎨 INYECCIÓN DINÁMICA DE COLORES CSS
  // Se ejecuta PRIMERO para garantizar que las variables estén disponibles
  useEffect(() => {
    const root = document.documentElement;
    
    // Inyectar colores modo claro
    root.style.setProperty('--color-light-bg', COLORS.lightBg);
    root.style.setProperty('--color-light-bg-secondary', COLORS.lightBgSecondary);
    root.style.setProperty('--color-light-bg-tertiary', COLORS.lightBgTertiary);
    root.style.setProperty('--color-light-text-primary', COLORS.lightTextPrimary);
    root.style.setProperty('--color-light-text-secondary', COLORS.lightTextSecondary);
    root.style.setProperty('--color-light-text-tertiary', COLORS.lightTextTertiary);
    root.style.setProperty('--color-light-border', COLORS.lightBorder);
    root.style.setProperty('--color-light-border-secondary', COLORS.lightBorderSecondary);
    
    // Inyectar colores modo oscuro
    root.style.setProperty('--color-dark-bg', COLORS.darkBg);
    root.style.setProperty('--color-dark-bg-secondary', COLORS.darkBgSecondary);
    root.style.setProperty('--color-dark-bg-tertiary', COLORS.darkBgTertiary);
    
    // Inyectar colores primary
    root.style.setProperty('--color-primary', isDark ? COLORS.primary : COLORS.lightPrimary);
    root.style.setProperty('--color-primary-hover', isDark ? COLORS.primaryHover : COLORS.lightPrimaryHover);
    root.style.setProperty('--color-primary-light', isDark ? COLORS.primaryLight : COLORS.lightPrimaryLight);
    root.style.setProperty('--color-sistemas', isDark ? COLORS.primaryLight : COLORS.lightPrimaryLight);
    // Acento de las clases (bg-acento, border-acento/40...): azul en oscuro, terracota en claro
    root.style.setProperty('--color-acento', isDark ? COLORS.primary : COLORS.lightPrimary);
    root.style.setProperty('--color-acento-hover', isDark ? COLORS.primaryHover : COLORS.lightPrimaryHover);
    root.style.setProperty('--color-acento-light', isDark ? COLORS.primaryLight : COLORS.lightPrimaryLight);
    root.style.setProperty('--color-light-primary', COLORS.lightPrimary);
    root.style.setProperty('--color-light-primary-hover', COLORS.lightPrimaryHover);
    root.style.setProperty('--color-light-primary-light', COLORS.lightPrimaryLight);
    root.style.setProperty('--color-light-primary-soft', COLORS.lightPrimarySoft);
    
    // Log para debugging
    console.log('🎨 [AppContext] Colores inyectados:', {
      'lightBg': COLORS.lightBg,
      'lightBgSecondary': COLORS.lightBgSecondary,
      'lightBgTertiary': COLORS.lightBgTertiary,
    });
  }, [isDark]);

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