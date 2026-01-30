import { useState, useEffect } from 'react';
import { auth, googleProvider } from "../lib/firebase";
import { signOut, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { useApp } from '../context/AppContext';

export default function Navbar({ data, onUpdate }) {
  const { isDark, setIsDark, lang, setLang, isAdmin, isAdminDetected, user, loading } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Home');
  const [scrolled, setScrolled] = useState(false);

  const ADMIN_EMAIL = "mascuka410@gmail.com";

  // Verificar resultado de redirect al cargar
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log('✅ Login por redirect exitoso:', result.user.email);
          if (result.user.email === ADMIN_EMAIL) {
            localStorage.setItem('portfolio_admin_detected', 'true');
          }
        }
      } catch (error) {
        console.error('Error al verificar redirect:', error);
      }
    };
    
    checkRedirectResult();
  }, []);

  const login = async () => {
    try {
      console.log('🔐 Intentando login con Google (popup)...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Login exitoso:', result.user.email);
      
      if (result.user.email === ADMIN_EMAIL) {
        localStorage.setItem('portfolio_admin_detected', 'true');
        console.log('💾 Admin confirmado y guardado');
      } else {
        console.log('⚠️ Usuario logueado pero no es admin:', result.user.email);
      }
    } catch (error) {
      console.error("❌ Error login:", error);
      
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        console.log('🔄 Popup bloqueado, intentando con redirect...');
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError) {
          console.error('❌ Error con redirect:', redirectError);
        }
      }
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      await signOut(auth);
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error("❌ Error logout:", error);
    }
  };

  const handleNavClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' });
      setActiveSection(id);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', nameEN: 'Home', id: 'Home' },
    { name: 'Habilidades', nameEN: 'Skills', id: 'Habilidades' },
    { name: 'Proyectos', nameEN: 'Projects', id: 'Proyectos' },
    { name: 'Experiencia', nameEN: 'Experience', id: 'Experiencia' }
  ];

  // RENDERIZADO CON DISEÑO PREMIUM
  const renderAdminButton = () => {
    if (loading) {
      return null;
    }

    // ADMIN MODE ACTIVO - Diseño dorado premium
    if (user && user.email === ADMIN_EMAIL) {
      return (
        <div className="flex items-center gap-3 animate-in slide-in-from-left-4 duration-500">
          {/* Badge Admin Mode con gradiente dorado */}
          <div className={`relative px-4 py-1.5 rounded-full font-bold text-xs tracking-wider uppercase overflow-hidden group ${
            isDark 
              ? 'bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-600/20 text-yellow-400 shadow-lg shadow-yellow-500/20' 
              : 'bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-100 text-yellow-700 shadow-lg shadow-yellow-200/50'
          }`}>
            {/* Brillo animado */}
            <div className={`absolute inset-0 ${
              isDark ? 'bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent' : 'bg-gradient-to-r from-transparent via-white/50 to-transparent'
            } translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000`} />
            
            {/* Borde dorado */}
            <div className={`absolute inset-0 rounded-full ${
              isDark ? 'ring-1 ring-yellow-500/40' : 'ring-1 ring-yellow-400/60'
            }`} />
            
            {/* Icono y texto */}
            <span className="relative flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Admin Mode
            </span>
          </div>
          
          {/* Botón Logout elegante */}
          <button 
            onClick={logout} 
            className={`relative px-4 py-1.5 rounded-full font-medium text-xs tracking-wider uppercase overflow-hidden group transition-all duration-300 ${
              isDark 
                ? 'bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-400 hover:from-red-500/20 hover:to-rose-500/20 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 ring-1 ring-red-500/30 hover:ring-red-500/50' 
                : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-600 hover:from-red-100 hover:to-rose-100 shadow-lg shadow-red-200/50 hover:shadow-red-200/70 ring-1 ring-red-200/60 hover:ring-red-300'
            }`}
            title="Cerrar sesión"
          >
            {/* Brillo al hover */}
            <div className={`absolute inset-0 ${
              isDark ? 'bg-gradient-to-r from-transparent via-red-400/10 to-transparent' : 'bg-gradient-to-r from-transparent via-white/50 to-transparent'
            } translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700`} />
            
            <span className="relative flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Salir
            </span>
          </button>
        </div>
      );
    }

    // BOTÓN LOGIN - Diseño dorado elegante
    if (isAdminDetected) {
      return (
        <button 
          onClick={login} 
          className={`relative px-5 py-2 rounded-full font-bold text-xs tracking-widest uppercase overflow-hidden group transition-all duration-300 ${
            isDark 
              ? 'bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-yellow-600/10 text-yellow-400 hover:from-yellow-500/20 hover:via-amber-500/20 hover:to-yellow-600/20 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 ring-1 ring-yellow-500/30 hover:ring-yellow-500/50' 
              : 'bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-100 text-yellow-700 hover:from-yellow-100 hover:via-amber-100 hover:to-yellow-200 shadow-lg shadow-yellow-200/50 hover:shadow-yellow-300/70 ring-1 ring-yellow-300/60 hover:ring-yellow-400'
          }`}
          title="Iniciar sesión como administrador"
        >
          {/* Brillo animado al hover */}
          <div className={`absolute inset-0 ${
            isDark ? 'bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent' : 'bg-gradient-to-r from-transparent via-white/60 to-transparent'
          } translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000`} />
          
          <span className="relative flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Admin
          </span>
        </button>
      );
    }

    return null;
  };

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 font-sans ${
      scrolled 
        ? (isDark ? 'bg-[#0A0F1A]/80 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 py-3')
        : 'bg-transparent py-6'
    }`}>
      <div className="max-w-[2000px] mx-auto px-6 md:px-12 flex justify-between items-center">
        
        {/* LADO IZQUIERDO: Admin premium */}
        <div className="flex items-center gap-4 min-w-[200px]">
          {/* Botón secreto de emergencia - Triple click */}
          <div 
            onClick={(e) => {
              if (e.detail === 3) {
                console.log('🔓 Botón secreto activado - Forzando login');
                login();
              }
            }}
            className="w-10 h-10 cursor-default opacity-0 hover:opacity-5 transition-opacity rounded-lg"
            title="Triple click para login de emergencia"
          />

          {renderAdminButton()}
        </div>

        {/* LADO DERECHO: Menú, Idiomas y Tema */}
        <div className="flex items-center gap-8">
          {/* Desktop Menu */}
          <ul className="hidden lg:flex gap-10">
            {navLinks.map((link) => (
              <li 
                key={link.id} 
                onClick={() => handleNavClick(link.id)} 
                className={`relative cursor-pointer text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 group ${
                  activeSection === link.id 
                    ? (isDark ? 'text-white' : 'text-slate-900') 
                    : (isDark ? 'text-white/40 hover:text-white/80' : 'text-slate-400 hover:text-slate-600')
                }`}
              >
                {lang === 'ES' ? link.name : link.nameEN}
                <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-[1px] bg-[#0078C8] transition-all duration-300 ${
                  activeSection === link.id 
                    ? 'w-full opacity-100' 
                    : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-50'
                }`} />
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Controls */}
          <div className="hidden lg:flex items-center gap-6 border-l pl-6 border-white/10">
            {/* Lang Selector */}
            <div className={`flex p-1 rounded-full border text-[9px] font-black ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
            }`}>
              <button 
                onClick={() => setLang('ES')} 
                className={`px-3 py-1 rounded-full transition-all ${
                  lang === 'ES' 
                    ? (isDark ? 'bg-white/10 text-white' : 'bg-white text-[#0078C8] shadow-sm') 
                    : 'text-slate-500'
                }`}
              >
                ES
              </button>
              <button 
                onClick={() => setLang('EN')} 
                className={`px-3 py-1 rounded-full transition-all ${
                  lang === 'EN' 
                    ? (isDark ? 'bg-white/10 text-white' : 'bg-white text-[#0078C8] shadow-sm') 
                    : 'text-slate-500'
                }`}
              >
                EN
              </button>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={() => setIsDark(!isDark)} 
              className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 border ${
                isDark 
                  ? 'bg-[#111827] border-white/5 text-yellow-400 hover:border-yellow-400/30' 
                  : 'bg-white border-slate-200 text-slate-400 hover:border-blue-500/30 hover:text-blue-500'
              }`}
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className={`lg:hidden absolute top-full left-0 w-full ${
          isDark ? 'bg-[#0A0F1A]/95 backdrop-blur-xl border-b border-white/5' : 'bg-white/95 backdrop-blur-xl border-b border-slate-200/50'
        }`}>
          <div className="px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`block w-full text-left py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                  activeSection === link.id
                    ? (isDark ? 'text-white' : 'text-slate-900')
                    : (isDark ? 'text-white/40' : 'text-slate-400')
                }`}
              >
                {lang === 'ES' ? link.name : link.nameEN}
              </button>
            ))}
            
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className={`flex p-1 rounded-full border text-[9px] font-black ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
              }`}>
                <button 
                  onClick={() => setLang('ES')} 
                  className={`px-3 py-1 rounded-full transition-all ${
                    lang === 'ES' 
                      ? (isDark ? 'bg-white/10 text-white' : 'bg-white text-[#0078C8] shadow-sm') 
                      : 'text-slate-500'
                  }`}
                >
                  ES
                </button>
                <button 
                  onClick={() => setLang('EN')} 
                  className={`px-3 py-1 rounded-full transition-all ${
                    lang === 'EN' 
                      ? (isDark ? 'bg-white/10 text-white' : 'bg-white text-[#0078C8] shadow-sm') 
                      : 'text-slate-500'
                  }`}
                >
                  EN
                </button>
              </div>

              <button 
                onClick={() => setIsDark(!isDark)} 
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 border ${
                  isDark 
                    ? 'bg-[#111827] border-white/5 text-yellow-400' 
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {isDark ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}