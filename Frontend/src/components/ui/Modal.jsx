import { getModalClass } from '../../constants/styles';
import { useApp } from '../../context/AppContext';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  hideClose = false, 
  centered = false,
  maxWidth = "", // Nueva prop para controlar el ancho
  hideHeader = false // Nueva prop para ocultar el cabezal si es necesario
}) {
  const { isDark } = useApp();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[500] p-2 md:p-4">
      {/* Combinamos la clase original con la nueva maxWidth si existe */}
      <div className={`${getModalClass(isDark)} ${maxWidth} transition-all duration-500 overflow-hidden`}>
        
        {!hideHeader && (
          <div className={`px-8 py-6 border-b border-white/5 flex items-center bg-gradient-to-r from-[#00A3FF]/10 to-transparent ${centered ? 'justify-center' : 'justify-between'}`}>
            <div className={centered ? 'text-center' : ''}>
              <h3 className={`text-sm font-black uppercase tracking-[0.4em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </h3>
              {subtitle && (
                <p className="text-[10px] text-[#00A3FF] font-bold uppercase tracking-widest opacity-70 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {!hideClose && (
              <button onClick={onClose} className="p-2 hover:bg-red-500/10 rounded-full transition-all">
                <svg className="w-5 h-5 text-slate-500 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Si ocultamos el header, quitamos el padding para que la imagen aproveche todo el espacio */}
        <div className={hideHeader ? "p-0" : "p-8"}>
          {children}
        </div>
      </div>
    </div>
  );
}