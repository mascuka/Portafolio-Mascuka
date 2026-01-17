import { useState, useEffect } from 'react';
import { auth } from "../lib/firebase";
import { signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useApp } from '../context/AppContext';
import ImageUploader from './ImageUploader';

export default function Navbar({ data, onUpdate }) {
  const [user] = useAuthState(auth);
  const { isDark, setIsDark, lang, setLang, isAdmin } = useApp();
  const [isEditNav, setIsEditNav] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [navForm, setNavForm] = useState({ 
    brand: data?.brand || "Santiago Mascuka",
    role: data?.role || "Software Engineer",
    logo: data?.logo || "",
    logoPublicId: data?.logoPublicId || ""
  });
  const [activeSection, setActiveSection] = useState('Home');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (data) {
      setNavForm({
        brand: data.brand || "Santiago Mascuka",
        role: data.role || "Software Engineer",
        logo: data.logo || "",
        logoPublicId: data.logoPublicId || ""
      });
    }
  }, [data]);

  const login = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const navLinks = [
    { name: 'Home', nameEN: 'Home', id: 'Home' },
    { name: 'Proyectos', nameEN: 'Projects', id: 'Proyectos' },
    { name: 'Habilidades', nameEN: 'Skills', id: 'Habilidades' },
    { name: 'Experiencia', nameEN: 'Experience', id: 'Experiencia' }
  ];

  const handleNavClick = (id) => {
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 800);

    const element = document.getElementById(id);
    if (element) {
      const offset = id === 'Home' ? 0 : 100;
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
              ? 'bg-[#0A0F1A]/95 backdrop-blur-xl border-b border-white/5 py-2.5 shadow-lg shadow-black/10' 
              : 'bg-white/95 backdrop-blur-xl border-b border-slate-200/60 py-2.5 shadow-lg shadow-slate-200/50'
            )
          : (isDark 
              ? 'bg-[#0A0F1A]/80 backdrop-blur-md py-3.5' 
              : 'bg-white/80 backdrop-blur-md py-3.5'
            )
      }`}>
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 flex justify-between items-center gap-2">
          
          {/* Logo y Marca */}
          <div onClick={() => handleNavClick('Home')} className="flex items-center gap-2.5 md:gap-4 cursor-pointer group z-[110] min-w-0">
            <div className="relative w-9 h-9 md:w-11 md:h-11 shrink-0">
              <div className={`w-full h-full overflow-hidden rounded-xl border-2 relative z-10 transition-all duration-300 group-hover:scale-105 ${
                isDark 
                  ? 'border-white/10 bg-gradient-to-br from-[#0078C8]/20 to-[#00A3FF]/10 group-hover:border-[#0078C8]/50' 
                  : 'border-slate-200 bg-gradient-to-br from-[#0078C8]/10 to-[#0078C8]/5 group-hover:border-[#0078C8]/70'
              }`}>
                {data?.logo ? (
                  <img src={data.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center font-black text-base md:text-lg transition-colors ${
                    isDark ? 'text-[#00A3FF] group-hover:text-[#0078C8]' : 'text-[#0078C8] group-hover:text-[#005A96]'
                  }`}>
                    {data?.brand?.charAt(0) || 'M'}
                  </div>
                )}
              </div>
              {isAdmin && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditNav(true); }} 
                  className={`absolute -top-1 -right-1 z-20 p-1 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
                    isDark ? 'bg-[#0078C8] text-white hover:bg-[#005A96]' : 'bg-[#0078C8] text-white hover:bg-[#005A96]'
                  }`}
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className={`text-xs sm:text-sm md:text-lg lg:text-xl font-black tracking-tighter truncate transition-colors ${
                isDark ? 'text-white group-hover:text-[#00A3FF]' : 'text-slate-900 group-hover:text-[#0078C8]'
              }`}>
                {data?.brand || 'Santiago Mascuka'}
              </h1>
              <span className={`text-[6px] sm:text-[7px] md:text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.15em] md:tracking-[0.3em] truncate ${
                isDark ? 'text-[#00A3FF]/70' : 'text-[#0078C8]/70'
              }`}>
                {data?.role || 'Software Engineer'}
              </span>
            </div>
          </div>

          {/* Botón hamburguesa mobile */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`lg:hidden z-[110] p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
              isDark ? 'hover:bg-white/5' : 'hover:bg-slate-200/50'
            }`}
          >
            <div className="w-5 h-4 relative flex flex-col justify-between">
              <span className={`w-full h-0.5 rounded-full transition-all duration-300 ${
                isDark ? 'bg-white' : 'bg-slate-900'
              } ${isOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`w-full h-0.5 rounded-full transition-all duration-300 ${
                isDark ? 'bg-white' : 'bg-slate-900'
              } ${isOpen ? 'opacity-0' : ''}`} />
              <span className={`w-full h-0.5 rounded-full transition-all duration-300 ${
                isDark ? 'bg-white' : 'bg-slate-900'
              } ${isOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </div>
          </button>

          {/* Navegación desktop */}
          <div className="hidden lg:flex items-center gap-10">
            <ul className="flex gap-8 text-[9px] font-black uppercase tracking-[0.25em]">
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

            <div className={`flex items-center gap-5 border-l pl-6 ${
              isDark ? 'border-white/[0.08]' : 'border-slate-300/50'
            }`}>
              {/* Selector de idioma */}
              <button 
                onClick={() => setLang(lang === 'ES' ? 'EN' : 'ES')} 
                className={`text-[9px] font-black hover:scale-110 transition-all duration-300 px-2 py-1 rounded ${
                  isDark ? 'text-[#0078C8] hover:bg-[#0078C8]/10' : 'text-[#0078C8] hover:bg-[#0078C8]/10'
                }`}
              >
                {lang}
              </button>
              
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

          {/* Menú mobile - MEJORADO CON SCROLL */}
          <div className={`lg:hidden fixed inset-0 z-[100] transition-all duration-500 ${
            isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}>
            <div className={`absolute inset-0 backdrop-blur-xl ${
              isDark ? 'bg-[#0A0F1A]/98' : 'bg-white/98'
            }`} />
            
            {/* Contenedor con scroll */}
            <div className="relative h-full overflow-y-auto">
              <div className="min-h-full flex flex-col items-center justify-center py-20 px-6">
                <ul className="flex flex-col items-center gap-6 text-xl font-black uppercase tracking-[0.3em] mb-10">
                  {navLinks.map((link) => (
                    <li 
                      key={link.id} 
                      onClick={() => handleNavClick(link.id)} 
                      className={`transition-all duration-300 hover:scale-105 cursor-pointer ${
                        activeSection === link.id 
                          ? (isDark ? 'text-[#0078C8]' : 'text-[#0078C8]') 
                          : (isDark ? 'text-white' : 'text-slate-900')
                      }`}
                    >
                      {lang === 'ES' ? link.name : link.nameEN}
                    </li>
                  ))}
                </ul>
                
                <div className={`flex flex-col items-center gap-6 pt-8 border-t w-48 ${
                  isDark ? 'border-white/10' : 'border-slate-300'
                }`}>
                  <button 
                    onClick={() => { setLang(lang === 'ES' ? 'EN' : 'ES'); setIsOpen(false); }} 
                    className={`font-black text-sm transition-all hover:scale-105 ${
                      isDark ? 'text-[#0078C8]' : 'text-[#0078C8]'
                    }`}
                  >
                    {lang === 'ES' ? 'English' : 'Español'}
                  </button>
                  
                  <button 
                    onClick={() => { setIsDark(!isDark); setIsOpen(false); }} 
                    className={`w-14 h-7 rounded-full relative transition-all ${
                      isDark ? 'bg-[#0078C8]/20 border border-[#0078C8]/40' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full transition-all flex items-center justify-center ${
                      isDark ? 'left-8 bg-[#0078C8]' : 'left-1 bg-white shadow-md'
                    }`}>
                      {isDark ? (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de edición */}
        {isEditNav && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-[500] p-4 overflow-y-auto">
            <div className={`w-full max-w-lg p-8 md:p-10 rounded-3xl border transition-all my-8 ${
              isDark ? 'bg-[#0A0E14] border-white/10' : 'bg-white border-slate-200'
            }`}>
              <h3 className={`font-black uppercase tracking-[0.4em] text-[10px] mb-8 text-center ${
                isDark ? 'text-[#0078C8]' : 'text-[#0078C8]'
              }`}>
                Editor de Identidad
              </h3>
              <div className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className={`w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed p-1 ${
                    isDark ? 'border-[#0078C8]/30' : 'border-[#0078C8]/30'
                  }`}>
                    <ImageUploader 
                      currentImage={navForm.logo} 
                      onImageChange={(url, id) => setNavForm(p => ({...p, logo: url, logoPublicId: id}))} 
                      isDark={isDark} 
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <input 
                    className={`w-full bg-transparent border-b-2 p-3 outline-none font-bold transition-colors ${
                      isDark 
                        ? 'border-white/10 text-white focus:border-[#0078C8]' 
                        : 'border-slate-300 text-slate-900 focus:border-[#0078C8]'
                    }`} 
                    value={navForm.brand} 
                    onChange={(e) => setNavForm({...navForm, brand: e.target.value})} 
                    placeholder="Nombre de Marca" 
                  />
                  <input 
                    className={`w-full bg-transparent border-b-2 p-3 outline-none font-bold transition-colors ${
                      isDark 
                        ? 'border-white/10 text-[#0078C8] focus:border-[#0078C8]' 
                        : 'border-slate-300 text-[#0078C8] focus:border-[#0078C8]'
                    }`} 
                    value={navForm.role} 
                    onChange={(e) => setNavForm({...navForm, role: e.target.value})} 
                    placeholder="Rol / Puesto" 
                  />
                </div>
                <div className="space-y-3 pt-4">
                  <button 
                    onClick={() => { onUpdate(navForm); setIsEditNav(false); }} 
                    className="w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] transition-all bg-[#0078C8] text-white hover:bg-[#005A96] shadow-lg shadow-[#0078C8]/20"
                  >
                    Guardar Cambios
                  </button>
                  <button 
                    onClick={() => setIsEditNav(false)} 
                    className={`w-full text-[9px] font-bold uppercase tracking-widest py-3 ${
                      isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'
                    }`}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}