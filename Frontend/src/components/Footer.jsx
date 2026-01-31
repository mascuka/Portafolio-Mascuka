import { useApp } from '../context/AppContext';

export default function Footer() {
  const { isDark, lang } = useApp();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full mt-auto">
      <div className={`w-full py-3 sm:py-4 px-6 sm:px-8 md:px-12 transition-all duration-700 border-t ${
        isDark 
          ? 'bg-[#0A0E17] border-white/5 text-slate-400' 
          : 'bg-white border-slate-200 text-slate-700' 
      }`}>
        <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Espaciador para centrar en desktop */}
          <div className="hidden md:block md:flex-1"></div>

          {/* BLOQUE CENTRAL: Frase completa con icono - SIEMPRE EN UNA LÍNEA */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 md:flex-[3]">
            <span className={`text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.12em] sm:tracking-[0.15em] font-['Quicksand'] whitespace-nowrap ${
              isDark ? 'font-light' : 'font-semibold'
            }`}>
              {lang === 'ES' ? "No detengas a quien se quiere ir" : "Don't stop those who want to leave"}
            </span>
            
            <div className={`flex-shrink-0 ${isDark ? 'text-[#0078C8] opacity-60' : 'text-[#0078C8] opacity-80'}`}>
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>

            <span className={`text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.12em] sm:tracking-[0.15em] font-['Quicksand'] whitespace-nowrap ${
              isDark ? 'font-light' : 'font-semibold'
            }`}>
              {lang === 'ES' ? "no corras a quien acaba de llegar" : "don't run to those who just arrived"}
            </span>
          </div>

          {/* BLOQUE DERECHO: Botón Volver al inicio */}
          <div className="md:flex-1 flex justify-center sm:justify-end">
            <button 
              onClick={scrollToTop}
              className={`group flex items-center gap-2.5 sm:gap-3 transition-all duration-300 ${
                isDark ? 'hover:text-[#0078C8]' : 'hover:text-[#0078C8] text-slate-900'
              }`}
            >
              <span className={`text-[8px] sm:text-[9px] font-['Quicksand'] font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em] transition-opacity whitespace-nowrap ${
                isDark ? 'opacity-40 group-hover:opacity-100' : 'opacity-70 group-hover:opacity-100'
              }`}>
                {lang === 'ES' ? 'Volver al inicio' : 'Back to top'}
              </span>
              <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl transition-all duration-500 ${
                isDark 
                  ? 'bg-white/5 text-white group-hover:bg-[#0078C8]' 
                  : 'bg-slate-900 text-white group-hover:bg-[#0078C8]'
              } group-hover:shadow-[0_5px_15px_rgba(0,120,200,0.3)]`}>
                <svg 
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:-translate-y-1 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                </svg>
              </div>
            </button>
          </div>
          
        </div>
      </div>
    </footer>
  );
}