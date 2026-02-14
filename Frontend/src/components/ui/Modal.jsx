import { useEffect } from 'react';
import { getModalClass } from '../../constants/styles';
import { useApp } from '../../context/AppContext';

/**
 * MODAL REUTILIZABLE
 * Componente de modal con animaciones, accesibilidad y variantes
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  hideClose = false, 
  centered = false,
  maxWidth = '', 
  hideHeader = false,
  closeOnOverlay = true,
  closeOnEscape = true,
  ...props
}) {
  const { isDark } = useApp();
  
  // Cerrar con ESC
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);
  
  // Prevenir scroll del body cuando el modal está abierto
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
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[500] p-2 md:p-4 animate-fadeIn"
      onClick={closeOnOverlay ? (e) => {
        if (e.target === e.currentTarget) onClose();
      } : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      {...props}
    >
      <div 
        className={`
          ${getModalClass(isDark)} 
          ${maxWidth || 'max-w-2xl'} 
          transition-all duration-500 
          animate-slideUp
        `}
      >
        {/* Header */}
        {!hideHeader && (
          <div className={`
            px-8 py-6 border-b transition-colors
            ${isDark ? 'border-white/5' : 'border-slate-200'}
            ${centered ? 'text-center' : ''}
            flex items-center justify-between
            bg-gradient-to-r from-[#00A3FF]/10 to-transparent
          `}>
            <div className={centered ? 'flex-1' : ''}>
              {title && (
                <h3 
                  id="modal-title"
                  className={`
                    text-sm font-black uppercase tracking-[0.4em]
                    ${isDark ? 'text-white' : 'text-slate-900'}
                  `}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[10px] text-[#00A3FF] font-bold uppercase tracking-widest opacity-70 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* Botón de cierre */}
            {!hideClose && (
              <button 
                onClick={onClose}
                className="p-2 hover:bg-red-500/10 rounded-full transition-all group"
                aria-label="Cerrar modal"
              >
                <svg 
                  className="w-5 h-5 text-slate-500 group-hover:text-red-500 transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2.5" 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Contenido */}
        <div className={hideHeader ? 'p-0' : 'p-8'}>
          {children}
        </div>
      </div>
    </div>
  );
}