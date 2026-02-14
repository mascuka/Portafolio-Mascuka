import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';

/**
 * SECTION WRAPPER REFACTORIZADO
 * Envuelve secciones con backgrounds y efectos consistentes
 */
export default function SectionWrapper({ children, id }) {
  const { isDark } = useApp();
  
  // Estilos computados
  const bgColor = isDark ? COLORS.darkBg : COLORS.lightBg;
  const lineGradient = 'from-transparent via-[#0078C8]/30 to-transparent';
  
  const gridPattern = isDark 
    ? 'linear-gradient(rgba(0,120,200,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,120,200,0.08) 1px, transparent 1px)'
    : 'linear-gradient(rgba(0,120,200,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,120,200,0.1) 1px, transparent 1px)';
  
  const radialGradient = isDark 
    ? 'radial-gradient(circle at 30% 50%, rgba(0, 120, 200, 0.04) 0%, transparent 50%)'
    : 'radial-gradient(circle at 30% 50%, rgba(0, 120, 200, 0.08) 0%, transparent 50%)';

  return (
    <section 
      id={id} 
      className="min-h-screen py-20 pt-20 relative overflow-hidden transition-colors duration-700"
      style={{ backgroundColor: bgColor }}
    >
      {/* Separador superior con línea azul */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${lineGradient}`} />

      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none" 
        style={{
          backgroundImage: gridPattern,
          backgroundSize: '100px 100px'
        }} 
      />
      
      {/* Radial gradient */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ background: radialGradient }} 
      />

      {children}
    </section>
  );
}