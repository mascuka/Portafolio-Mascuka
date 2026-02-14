import { useApp } from '../../context/AppContext';
import Button from './Button';

/**
 * SECTION HEADER REUTILIZABLE
 * Componente de encabezado de sección con badge, título y acción opcional
 */
export default function SectionHeader({ 
  badge, 
  title, 
  onAction, 
  actionLabel,
  description,
  animate = true
}) {
  const { isDark } = useApp();
  
  return (
    <div className={`
      flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16
      ${animate ? 'animate-fadeInUp' : ''}
    `}>
      {/* Contenido principal */}
      <div className="flex-1">
        {/* Badge */}
        {badge && (
          <div className={`
            inline-flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-sm border mb-4
            transition-all duration-300
            ${isDark 
              ? 'bg-[#00A3FF]/10 border-[#00A3FF]/30 hover:bg-[#00A3FF]/15' 
              : 'bg-[#0078C8]/15 border-[#0078C8]/50 hover:bg-[#0078C8]/20'
            }
          `}>
            <span className={`
              text-[10px] font-black uppercase tracking-[0.25em]
              ${isDark ? 'text-[#00A3FF]' : 'text-[#005A96]'}
            `}>
              {badge}
            </span>
          </div>
        )}
        
        {/* Título */}
        <h1 className={`
          text-4xl sm:text-5xl md:text-6xl lg:text-7xl 
          font-black tracking-tighter leading-none mb-3 
          transition-all duration-700
          ${isDark ? 'text-white' : 'text-slate-900'}
        `}>
          {title}
        </h1>
        
        {/* Línea decorativa */}
        <div className={`
          h-[2px] w-16 bg-gradient-to-r to-transparent
          ${isDark ? 'from-[#00A3FF]' : 'from-[#0078C8]'}
        `} />
        
        {/* Descripción opcional */}
        {description && (
          <p className={`
            mt-4 text-sm md:text-base max-w-2xl
            ${isDark ? 'text-slate-400' : 'text-slate-600'}
          `}>
            {description}
          </p>
        )}
      </div>
      
      {/* Botón de acción */}
      {onAction && actionLabel && (
        <Button onClick={onAction} className="flex-shrink-0">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}