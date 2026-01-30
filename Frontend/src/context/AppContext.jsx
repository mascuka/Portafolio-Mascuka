import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, onIdTokenChanged } from 'firebase/auth';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

const ADMIN_EMAIL = "mascuka410@gmail.com";
const ADMIN_DETECTED_KEY = 'portfolio_admin_detected';

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState('ES');
  
  // Estado para saber si alguna vez te detectamos como admin
  const [isAdminDetected, setIsAdminDetected] = useState(() => {
    return localStorage.getItem(ADMIN_DETECTED_KEY) === 'true';
  });

  // El isAdmin real (basado en la sesión actual de Firebase)
  const isAdmin = user?.email === ADMIN_EMAIL;

  // VERIFICACIÓN AGRESIVA MÚLTIPLE
  useEffect(() => {
    console.log('🚀 AppContext iniciando - Verificaciones múltiples...');
    
    let mounted = true;
    
    // Verificación 1: Usuario actual INMEDIATO
    const checkCurrentUser = () => {
      const currentUser = auth.currentUser;
      console.log('1️⃣ Verificación inmediata - currentUser:', currentUser?.email || 'null');
      
      if (currentUser && mounted) {
        setUser(currentUser);
        setLoading(false);
        
        if (currentUser.email === ADMIN_EMAIL) {
          console.log('✅ ADMIN DETECTADO en verificación inmediata!');
          setIsAdminDetected(true);
          localStorage.setItem(ADMIN_DETECTED_KEY, 'true');
        }
      }
    };
    
    // Ejecutar inmediatamente
    checkCurrentUser();
    
    // Verificación 2: Re-verificar después de 500ms (por si Firebase está inicializando)
    const timeoutCheck = setTimeout(() => {
      console.log('2️⃣ Verificación retrasada (500ms)...');
      checkCurrentUser();
    }, 500);
    
    // Verificación 3: Listener estándar de cambios de auth
    const unsubscribeAuth = onAuthStateChanged(auth, (newUser) => {
      console.log('3️⃣ onAuthStateChanged disparado:', newUser?.email || 'null');
      
      if (!mounted) return;
      
      setUser(newUser);
      setLoading(false);
      
      if (newUser?.email === ADMIN_EMAIL) {
        console.log('✅ Admin detectado en onAuthStateChanged!');
        setIsAdminDetected(true);
        localStorage.setItem(ADMIN_DETECTED_KEY, 'true');
      }
    });
    
    // Verificación 4: Listener de cambios de token (más sensible)
    const unsubscribeToken = onIdTokenChanged(auth, (newUser) => {
      console.log('4️⃣ onIdTokenChanged disparado:', newUser?.email || 'null');
      
      if (!mounted) return;
      
      if (newUser) {
        setUser(newUser);
        setLoading(false);
        
        if (newUser.email === ADMIN_EMAIL) {
          console.log('✅ Admin detectado en onIdTokenChanged!');
          setIsAdminDetected(true);
          localStorage.setItem(ADMIN_DETECTED_KEY, 'true');
        }
      }
    });
    
    // Verificación 5: Polling cada 2 segundos por 10 segundos
    let pollCount = 0;
    const pollingInterval = setInterval(() => {
      pollCount++;
      console.log(`5️⃣ Polling #${pollCount} - Verificando auth.currentUser...`);
      
      const currentUser = auth.currentUser;
      if (currentUser && mounted) {
        console.log('✅ Usuario encontrado en polling:', currentUser.email);
        setUser(currentUser);
        setLoading(false);
        
        if (currentUser.email === ADMIN_EMAIL) {
          console.log('✅ Admin detectado en polling!');
          setIsAdminDetected(true);
          localStorage.setItem(ADMIN_DETECTED_KEY, 'true');
        }
        
        clearInterval(pollingInterval);
      }
      
      // Detener después de 5 intentos (10 segundos)
      if (pollCount >= 5) {
        console.log('⏹️ Polling detenido después de 5 intentos');
        clearInterval(pollingInterval);
        if (mounted && !auth.currentUser) {
          setLoading(false);
        }
      }
    }, 2000);

    return () => {
      mounted = false;
      clearTimeout(timeoutCheck);
      clearInterval(pollingInterval);
      unsubscribeAuth();
      unsubscribeToken();
      console.log('🧹 Limpiando listeners y timers');
    };
  }, []);

  // Log continuo para debugging
  useEffect(() => {
    console.log('📊 Estado AppContext actualizado:', {
      'auth.currentUser': auth.currentUser?.email || 'null',
      'state.user': user?.email || 'null',
      'isAdmin': isAdmin,
      'isAdminDetected': isAdminDetected,
      'loading': loading,
      'localStorage': localStorage.getItem(ADMIN_DETECTED_KEY)
    });
  }, [user, isAdmin, isAdminDetected, loading]);

  useEffect(() => {
    document.body.classList.toggle('light', !isDark);
  }, [isDark]);

  return (
    <AppContext.Provider value={{ 
      isDark, 
      setIsDark, 
      lang, 
      setLang, 
      isAdmin,           // true solo si estás logueado ahora
      isAdminDetected,   // true si alguna vez te logueaste como admin
      user, 
      loading 
    }}>
      {children}
    </AppContext.Provider>
  );
};