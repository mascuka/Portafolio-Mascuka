import { useApp } from '../context/AppContext';

export default function SectionWrapper({ children, id }) {
  const { isDark } = useApp();
  
  return (
    <section 
      id={id} 
      className={`min-h-screen py-20 pt-20 relative overflow-hidden transition-colors duration-700 ${
        isDark ? 'bg-[#080B12]' : 'bg-[#F5F7FA]'
      }`}
    >
      {/* Separador superior con línea azul */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${
        isDark 
          ? 'from-transparent via-[#0078C8]/30 to-transparent' 
          : 'from-transparent via-[#0078C8]/30 to-transparent'
      }`} />

      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none" 
        style={{
          backgroundImage: isDark 
            ? 'linear-gradient(rgba(0,120,200,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,120,200,0.08) 1px, transparent 1px)'
            : 'linear-gradient(rgba(0,120,200,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,120,200,0.1) 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }} 
      />
      
      {/* Radial gradient */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: isDark 
            ? 'radial-gradient(circle at 30% 50%, rgba(0, 120, 200, 0.04) 0%, transparent 50%)'
            : 'radial-gradient(circle at 30% 50%, rgba(0, 120, 200, 0.08) 0%, transparent 50%)'
        }} 
      />

      {children}
    </section>
  );
}