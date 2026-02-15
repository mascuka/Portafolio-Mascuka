import { useApp } from '../context/AppContext';
import { useEffect, useRef } from 'react';

/**
 * FOOTER REFACTORIZADO
 * Optimizado con mejor organización del código
 */
export default function Footer() {
  const { isDark, lang } = useApp();
  const containerRef = useRef(null);
  const textRef = useRef(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auto resize del texto central
  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const resizeText = () => {
      const maxSize = 11;
      const minSize = 6;
      let size = maxSize;

      text.style.fontSize = `${size}px`;

      while (text.scrollWidth > container.clientWidth && size > minSize) {
        size -= 0.5;
        text.style.fontSize = `${size}px`;
      }
    };

    resizeText();

    const observer = new ResizeObserver(resizeText);
    observer.observe(container);

    return () => observer.disconnect();
  }, [lang]);

  // Textos traducidos
  const text = {
    es: {
      first: 'No detengas a quien se quiere ir',
      second: 'no corras a quien acaba de llegar',
      backToTop: 'Volver al inicio'
    },
    en: {
      first: "Don't stop those who want to leave",
      second: "don't run to those who just arrived",
      backToTop: 'Back to top'
    }
  };

  const currentText = lang === 'ES' ? text.es : text.en;

  return (
    <footer className="w-full mt-auto">
      <div className={`
        w-full py-6 xl:py-4 px-6 sm:px-10 md:px-12 transition-all duration-700 border-t
        ${isDark
          ? 'bg-[#0A0E17] border-white/5 text-slate-400'
          : 'bg-[var(--color-light-bg-secondary)] border-slate-200 text-slate-700'
        }
      `}>
        <div className="max-w-[1800px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-6 xl:gap-4 min-w-0">

          {/* Espaciador XL */}
          <div className="hidden xl:block xl:flex-1" />

          {/* Bloque Central - Texto con auto-scale */}
          <div
            ref={containerRef}
            className="w-full xl:flex-[4] flex items-center justify-center min-w-0 overflow-hidden"
          >
            <div
              ref={textRef}
              className={`
                flex items-center justify-center gap-1.5 sm:gap-3 whitespace-nowrap uppercase 
                font-['Quicksand']
                ${isDark ? 'font-light' : 'font-semibold'}
              `}
              style={{ letterSpacing: '0.12em' }}
            >
              <span>{currentText.first}</span>

              {/* Ícono código */}
              <div className={`
                flex-shrink-0
                ${isDark ? 'text-[#0078C8] opacity-60' : 'text-[#0078C8] opacity-80'}
              `}>
                <svg
                  className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>

              <span>{currentText.second}</span>
            </div>
          </div>

          {/* Bloque Derecho - Botón volver arriba */}
          <div className="xl:flex-1 flex justify-center xl:justify-end w-full">
            <button
              onClick={scrollToTop}
              className={`
                group flex items-center gap-2.5 sm:gap-3 transition-all duration-300
                ${isDark ? 'hover:text-[#0078C8]' : 'hover:text-[#0078C8] text-slate-900'}
              `}
            >
              <span className={`
                text-[8px] sm:text-[9px] font-['Quicksand'] font-bold uppercase 
                tracking-[0.18em] sm:tracking-[0.2em] transition-all whitespace-nowrap
                ${isDark
                  ? 'text-slate-400 group-hover:text-[#0078C8]'
                  : 'opacity-70 group-hover:opacity-100'
                }
              `}>
                {currentText.backToTop}
              </span>

              <div className={`
                flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 
                rounded-xl transition-all duration-500
                ${isDark
                  ? 'bg-white/5 text-white group-hover:bg-[#0078C8]'
                  : 'bg-slate-900 text-white group-hover:bg-[#0078C8]'
                } 
                group-hover:shadow-[0_5px_15px_rgba(0,120,200,0.3)]
              `}>
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:-translate-y-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </div>
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
}