import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider = ({ children }) => {
  const [user] = useAuthState(auth);
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState('ES');
  
  const isAdmin = user?.email === "mascuka410@gmail.com";

  useEffect(() => {
    if (!isDark) {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [isDark]);

  return (
    <AppContext.Provider value={{ isDark, setIsDark, lang, setLang, isAdmin, user }}>
      {children}
    </AppContext.Provider>
  );
};