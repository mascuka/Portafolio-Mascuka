import { useState, useEffect } from 'react';
import { auth } from "../lib/firebase";
import { signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useApp } from '../context/AppContext';

export default function Navbar({ data, onUpdate }) {
  const [user] = useAuthState(auth);
  const { isDark, setIsDark, lang, setLang, isAdmin } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeSection, setActiveSection] = useState('Home');
  const [scrolled, setScrolled] = useState(false);

  const login = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const navLinks = [
    { name: 'Home', nameEN: 'Home', id: 'Home' },
     { name: 'Habilidades', nameEN: 'Skills', id: 'Habilidades' },
    { name: 'Proyectos', nameEN: 'Projects', id: 'Proyectos' },
    { name: 'Experiencia', nameEN: 'Experience', id: 'Experiencia' }
  ];

  const handleNavClick = (id) => {
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 800);

    const element = document.getElementById(id);
    if (element) {
      // Home no tiene offset, el resto sí (navbar ~70px + SectionWrapper pt-24 ~96px = ~166px)
      const offset = id === 'Home' ? 0 : 30;
      
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
      setActiveSection(id);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const scrollPosition = window.scrollY + 150;
      navLinks.forEach(link => {
        const element = document.getElementById(link.id);
        if (element && scrollPosition >= element.offsetTop && scrollPosition < element.offsetTop + element.offsetHeight) {
          setActiveSection(link.id);
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloquear scroll cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {isTransitioning && (
        <div className="fixed inset-0 z-[90] pointer-events-none">
          <div className={`absolute inset-0 transition-opacity duration-300 ${
            isDark ? 'bg-[#080B12]' : 'bg-[#F5F7FA]'
          }`} style={{ opacity: 0.3 }} />
        </div>
      )}

      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
        scrolled 
          ? (isDark 
              ? 'bg-[#0A0F1A]/95 backdrop-blur-xl border-b border-white/5 py-4 shadow-lg shadow-black/10' 
              : 'bg-[#F5F7FA]/95 backdrop-blur-xl border-b border-slate-200/60 py-4 shadow-lg shadow-slate-200/50'
            )
          : (isDark 
              ? 'bg-[#0A0F1A]/80 backdrop-blur-md py-5' 
              : 'bg-[#F5F7FA]/80 backdrop-blur-md py-5'
            )
      }`}>
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 flex justify-between items-center gap-4">

          {/* Botón hamburguesa mobile - IZQUIERDA */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`lg:hidden z-[250] p-2.5 rounded-lg transition-all duration-300 hover:scale-105 ${
              isDark ? 'hover:bg-white/5' : 'hover:bg-slate-200/50'
            }`}
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span className={`w-full h-[3px] rounded-full transition-all duration-300 ${
                isDark ? 'bg-white' : 'bg-slate-900'
              } ${isOpen ? 'rotate-45 translate-y-[8px]' : ''}`} />
              <span className={`w-full h-[3px] rounded-full transition-all duration-300 ${
                isDark ? 'bg-white' : 'bg-slate-900'
              } ${isOpen ? 'opacity-0' : ''}`} />
              <span className={`w-full h-[3px] rounded-full transition-all duration-300 ${
                isDark ? 'bg-white' : 'bg-slate-900'
              } ${isOpen ? '-rotate-45 -translate-y-[8px]' : ''}`} />
            </div>
          </button>

          {/* Navegación desktop - DERECHA */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-10 ml-auto">
            <ul className="flex gap-6 xl:gap-8 text-[9px] font-black uppercase tracking-[0.25em]">
              {navLinks.map((link) => (
                <li 
                  key={link.id} 
                  onClick={() => handleNavClick(link.id)} 
                  className={`cursor-pointer transition-all duration-300 relative group/link ${
                    activeSection === link.id 
                      ? (isDark ? 'text-[#0078C8]' : 'text-[#0078C8]') 
                      : (isDark ? 'text-white/50 hover:text-white/80' : 'text-slate-500 hover:text-slate-700')
                  }`}
                >
                  {lang === 'ES' ? link.name : link.nameEN}
                  <span className={`absolute -bottom-1 left-0 h-[2px] rounded-full transition-all duration-300 ${
                    activeSection === link.id 
                      ? 'w-full bg-[#0078C8]'
                      : 'w-0 bg-[#0078C8] group-hover/link:w-full'
                  }`} />
                </li>
              ))}
            </ul>

            <div className={`flex items-center gap-3 xl:gap-5 border-l pl-4 xl:pl-6 ${
              isDark ? 'border-white/[0.08]' : 'border-slate-300/50'
            }`}>
              {/* Selector de idioma - ES / EN */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setLang('ES')} 
                  className={`text-[9px] font-black transition-all duration-300 px-2 py-1 rounded ${
                    lang === 'ES' 
                      ? 'bg-[#0078C8] text-white' 
                      : (isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-400 hover:text-slate-600')
                  }`}
                >
                  ES
                </button>
                <span className={`text-[9px] font-black ${isDark ? 'text-white/20' : 'text-slate-300'}`}>/</span>
                <button 
                  onClick={() => setLang('EN')} 
                  className={`text-[9px] font-black transition-all duration-300 px-2 py-1 rounded ${
                    lang === 'EN' 
                      ? 'bg-[#0078C8] text-white' 
                      : (isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-400 hover:text-slate-600')
                  }`}
                >
                  EN
                </button>
              </div>
              
              {/* Toggle dark mode */}
              <button 
                onClick={() => setIsDark(!isDark)} 
                className={`w-11 h-6 rounded-full relative transition-all duration-300 ${
                  isDark 
                    ? 'bg-[#0078C8]/20 border border-[#0078C8]/40' 
                    : 'bg-slate-300'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center ${
                  isDark 
                    ? 'left-[22px] bg-[#0078C8] shadow-[0_0_12px_rgba(0,120,200,0.5)]' 
                    : 'left-1 bg-white shadow-md'
                }`}>
                  {isDark ? (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  ) : (
                    <svg className="w-2.5 h-2.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Botón admin */}
              {!user ? (
                <button 
                  onClick={login} 
                  className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 border ${
                    isDark 
                      ? 'border-white/10 text-white/70 hover:bg-white/5 hover:text-white' 
                      : 'border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  Admin
                </button>
              ) : (
                <button 
                  onClick={() => signOut(auth)} 
                  className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                    isDark 
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                      : 'bg-red-50 text-red-500 hover:bg-red-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Menú mobile - FULLSCREEN CORREGIDO */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[200] flex flex-col">
          {/* Fondo con blur - NO CLICKEABLE para que no tape el botón */}
          <div 
            className={`absolute inset-0 backdrop-blur-xl -z-10 ${
              isDark ? 'bg-[#0A0F1A]/98' : 'bg-[#F5F7FA]/98'
            }`}
          />
          
          {/* Contenido del menú */}
          <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-20">
            {/* Links de navegación */}
            <ul className="flex flex-col items-center gap-8 mb-12">
              {navLinks.map((link) => (
                <li 
                  key={link.id} 
                  onClick={() => handleNavClick(link.id)} 
                  className={`transition-all duration-300 hover:scale-110 cursor-pointer text-2xl sm:text-3xl font-black uppercase tracking-[0.2em] ${
                    activeSection === link.id 
                      ? (isDark ? 'text-[#0078C8]' : 'text-[#0078C8]') 
                      : (isDark ? 'text-white' : 'text-slate-900')
                  }`}
                >
                  {lang === 'ES' ? link.name : link.nameEN}
                </li>
              ))}
            </ul>
            
            {/* Controles: idioma y dark mode */}
            <div className={`flex flex-col items-center gap-6 pt-8 border-t w-64 ${
              isDark ? 'border-white/10' : 'border-slate-300'
            }`}>
              {/* Selector de idioma */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setLang('ES'); setIsOpen(false); }} 
                  className={`font-black text-base transition-all hover:scale-105 px-6 py-3 rounded-lg ${
                    lang === 'ES' 
                      ? 'bg-[#0078C8] text-white' 
                      : (isDark ? 'text-white/60 hover:text-white bg-white/5' : 'text-slate-600 hover:text-slate-900 bg-slate-100')
                  }`}
                >
                  ES
                </button>
                <span className={`text-base font-black ${isDark ? 'text-white/30' : 'text-slate-400'}`}>/</span>
                <button 
                  onClick={() => { setLang('EN'); setIsOpen(false); }} 
                  className={`font-black text-base transition-all hover:scale-105 px-6 py-3 rounded-lg ${
                    lang === 'EN' 
                      ? 'bg-[#0078C8] text-white' 
                      : (isDark ? 'text-white/60 hover:text-white bg-white/5' : 'text-slate-600 hover:text-slate-900 bg-slate-100')
                  }`}
                >
                  EN
                </button>
              </div>
              
              {/* Toggle dark mode */}
              <button 
                onClick={() => { setIsDark(!isDark); setIsOpen(false); }} 
                className={`w-16 h-8 rounded-full relative transition-all ${
                  isDark ? 'bg-[#0078C8]/20 border border-[#0078C8]/40' : 'bg-slate-300'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full transition-all flex items-center justify-center ${
                  isDark ? 'left-9 bg-[#0078C8]' : 'left-1 bg-white shadow-md'
                }`}>
                  {isDark ? (
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}