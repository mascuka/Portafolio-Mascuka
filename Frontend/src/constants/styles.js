import { COLORS } from './colors';

/**
 * CLASES DE ESTILOS REUTILIZABLES
 * Todas las funciones de estilos centralizadas usando la paleta de colores
 */

export const getButtonClass = (isDark, variant = 'primary') => {
  const base = 'px-6 py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 hover:-translate-y-0.5 border';
  
  const variants = {
    primary: `bg-[${COLORS.primary}] text-white border-[${COLORS.primary}] hover:bg-[${COLORS.primaryHover}] shadow-lg shadow-[${COLORS.primary}]/20`,
    secondary: isDark
      ? 'bg-white/5 text-white border-white/10 hover:bg-white/10'
      : 'bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200',
    icon: isDark
      ? `p-3 rounded-xl bg-white/5 text-white/40 hover:bg-[${COLORS.primary}]/20 hover:text-[${COLORS.primary}]`
      : `p-3 rounded-xl bg-slate-100 text-slate-400 hover:bg-[${COLORS.primary}]/20 hover:text-[${COLORS.primary}]`
  };
  
  return `${base} ${variants[variant]}`;
};

export const getInputClass = (isDark) => 
  `w-full bg-transparent border-2 p-4 rounded-xl outline-none transition-all duration-300 ${
    isDark 
      ? `border-white/5 text-white focus:border-[${COLORS.primary}]/50 focus:bg-[${COLORS.primary}]/5` 
      : `border-slate-100 text-slate-900 focus:border-[${COLORS.primary}]/50 focus:bg-slate-50`
  }`;

export const getTextareaClass = (isDark) => 
  `w-full bg-transparent border-2 p-4 rounded-xl outline-none resize-none transition-all duration-300 ${
    isDark 
      ? `border-white/5 text-white focus:border-[${COLORS.primary}]/50 focus:bg-[${COLORS.primary}]/5` 
      : `border-slate-100 text-slate-900 focus:border-[${COLORS.primary}]/50 focus:bg-slate-50`
  }`;

export const getCardClass = (isDark) =>
  `rounded-2xl p-8 transition-all duration-500 border hover:-translate-y-1 ${
    isDark 
      ? `bg-white/[0.02] border-white/10 hover:border-[${COLORS.primary}]/30` 
      : `bg-white border-slate-200 hover:border-[${COLORS.primary}]/30 shadow-sm hover:shadow-lg`
  }`;

export const getModalClass = (isDark) =>
  `w-full max-w-2xl rounded-3xl overflow-hidden border ${
    isDark ? `bg-[${COLORS.darkBgTertiary}] border-white/10` : 'bg-white border-slate-200'
  }`;

export const getLabelClass = (isDark) =>
  `text-[10px] font-black uppercase tracking-widest text-[${COLORS.primary}]`;

// Nuevas utilidades para secciones
export const getSectionClass = (isDark) =>
  `min-h-screen py-20 pt-20 relative overflow-hidden transition-colors duration-700 ${
    isDark ? `bg-[${COLORS.darkBg}]` : `bg-[${COLORS.lightBg}]`
  }`;

export const getBadgeClass = (isDark) =>
  `inline-flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-sm border ${
    isDark 
      ? `bg-[${COLORS.primaryLight}]/10 border-[${COLORS.primaryLight}]/30` 
      : `bg-[${COLORS.primary}]/15 border-[${COLORS.primary}]/50`
  }`;