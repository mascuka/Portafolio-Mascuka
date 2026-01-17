// Paleta de colores unificada - Basada en el botón "Descargar CV"
export const COLORS = {
  primary: '#0078C8',      // Azul principal (botón CV)
  primaryHover: '#005A96', // Hover del azul principal
  primaryLight: '#0078C8', // Para modo claro (mismo color)
  accent: '#00A3FF',       // Acento (solo para textos destacados)
};

// Clases reutilizables con colores unificados
export const getButtonClass = (isDark, variant = 'primary') => {
  const base = 'px-6 py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 hover:-translate-y-0.5 border';
  
  const variants = {
    primary: 'bg-[#0078C8] text-white border-[#0078C8] hover:bg-[#005A96] shadow-lg shadow-[#0078C8]/20',
    secondary: isDark
      ? 'bg-white/5 text-white border-white/10 hover:bg-white/10'
      : 'bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200',
    icon: isDark
      ? 'p-3 rounded-xl bg-white/5 text-white/40 hover:bg-[#0078C8]/20 hover:text-[#0078C8]'
      : 'p-3 rounded-xl bg-slate-100 text-slate-400 hover:bg-[#0078C8]/20 hover:text-[#0078C8]'
  };
  
  return `${base} ${variants[variant]}`;
};

export const getInputClass = (isDark) => 
  `w-full bg-transparent border-2 p-4 rounded-xl outline-none transition-all duration-300 ${
    isDark 
      ? 'border-white/5 text-white focus:border-[#0078C8]/50 focus:bg-[#0078C8]/5' 
      : 'border-slate-100 text-slate-900 focus:border-[#0078C8]/50 focus:bg-slate-50'
  }`;

export const getTextareaClass = (isDark) => 
  `w-full bg-transparent border-2 p-4 rounded-xl outline-none resize-none transition-all duration-300 ${
    isDark 
      ? 'border-white/5 text-white focus:border-[#0078C8]/50 focus:bg-[#0078C8]/5' 
      : 'border-slate-100 text-slate-900 focus:border-[#0078C8]/50 focus:bg-slate-50'
  }`;

export const getCardClass = (isDark) =>
  `rounded-2xl p-8 transition-all duration-500 border hover:-translate-y-1 ${
    isDark 
      ? 'bg-white/[0.02] border-white/10 hover:border-[#0078C8]/30' 
      : 'bg-white border-slate-200 hover:border-[#0078C8]/30 shadow-sm hover:shadow-lg'
  }`;

export const getModalClass = (isDark) =>
  `w-full max-w-2xl rounded-3xl overflow-hidden border ${
    isDark ? 'bg-[#0A0E14] border-white/10' : 'bg-white border-slate-200'
  }`;

export const getLabelClass = (isDark) =>
  `text-[10px] font-black uppercase tracking-widest ${
    isDark ? 'text-[#0078C8]' : 'text-[#0078C8]'
  }`;