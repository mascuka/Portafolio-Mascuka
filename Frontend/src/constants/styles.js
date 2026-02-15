import { COLORS } from './colors';

/**
 * CLASES DE ESTILOS REUTILIZABLES - MODO CLARO SOFT/SLATE
 * Todas las funciones de estilos centralizadas usando la nueva paleta
 * Modo claro con tonos grises azulados suaves - NO blanco puro
 */

export const getButtonClass = (isDark, variant = 'primary') => {
  const base = 'px-6 py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 hover:-translate-y-0.5 border';
  
  const variants = {
    primary: `bg-[${COLORS.primary}] text-white border-[${COLORS.primary}] hover:bg-[${COLORS.primaryHover}] shadow-lg shadow-[${COLORS.primary}]/20`,
    secondary: isDark
      ? 'bg-white/5 text-white border-white/10 hover:bg-white/10'
      : 'bg-[var(--color-light-bg-tertiary)] text-[var(--color-light-text-primary)] border-[var(--color-light-border)] hover:bg-[var(--color-light-bg-secondary)] hover:border-[var(--color-light-border-secondary)]',
    icon: isDark
      ? `p-3 rounded-xl bg-white/5 text-white/40 hover:bg-[${COLORS.primary}]/20 hover:text-[${COLORS.primary}]`
      : `p-3 rounded-xl bg-[var(--color-light-bg-tertiary)] text-[var(--color-light-text-tertiary)] hover:bg-[${COLORS.primary}]/10 hover:text-[${COLORS.primary}]`
  };
  
  return `${base} ${variants[variant]}`;
};

export const getInputClass = (isDark) => 
  `w-full bg-transparent border-2 p-4 rounded-xl outline-none transition-all duration-300 ${
    isDark 
      ? `border-white/5 text-white focus:border-[${COLORS.primary}]/50 focus:bg-[${COLORS.primary}]/5` 
      : `border-[var(--color-light-border)] text-[var(--color-light-text-primary)] placeholder:text-[var(--color-light-text-tertiary)] focus:border-[${COLORS.primary}]/50 focus:bg-[var(--color-light-bg-tertiary)]`
  }`;

export const getTextareaClass = (isDark) => 
  `w-full bg-transparent border-2 p-4 rounded-xl outline-none resize-none transition-all duration-300 ${
    isDark 
      ? `border-white/5 text-white focus:border-[${COLORS.primary}]/50 focus:bg-[${COLORS.primary}]/5` 
      : `border-[var(--color-light-border)] text-[var(--color-light-text-primary)] placeholder:text-[var(--color-light-text-tertiary)] focus:border-[${COLORS.primary}]/50 focus:bg-[var(--color-light-bg-tertiary)]`
  }`;

export const getCardClass = (isDark) =>
  `rounded-2xl p-8 transition-all duration-500 border hover:-translate-y-1 ${
    isDark 
      ? `bg-white/[0.02] border-white/10 hover:border-[${COLORS.primary}]/30` 
      : `bg-[var(--color-light-bg-secondary)] border-[var(--color-light-border)] hover:border-[${COLORS.primary}]/30 hover:shadow-xl shadow-slate-900/10`
  }`;

export const getModalClass = (isDark) =>
  `w-full max-w-2xl rounded-3xl overflow-hidden border ${
    isDark 
      ? `bg-[${COLORS.darkBgTertiary}] border-white/10` 
      : 'bg-[var(--color-light-bg-secondary)] border-[var(--color-light-border)] shadow-2xl'
  }`;

export const getLabelClass = (isDark) =>
  `text-[10px] font-black uppercase tracking-widest ${
    isDark ? `text-[${COLORS.primary}]` : `text-[${COLORS.primaryHover}]`
  }`;

// Utilidades para secciones
export const getSectionClass = (isDark) =>
  `min-h-screen py-20 pt-20 relative overflow-hidden transition-colors duration-700 ${
    isDark ? `bg-[${COLORS.darkBg}]` : `bg-[${COLORS.lightBg}]`
  }`;

export const getBadgeClass = (isDark) =>
  `inline-flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-sm border transition-all duration-300 ${
    isDark 
      ? `bg-[${COLORS.primaryLight}]/10 border-[${COLORS.primaryLight}]/30` 
      : `bg-[${COLORS.primary}]/10 border-[${COLORS.primary}]/25 hover:bg-[${COLORS.primary}]/15 hover:border-[${COLORS.primary}]/35`
  }`;

// Utilidad para textos según el modo
export const getTextClass = (isDark, variant = 'primary') => {
  const variants = {
    primary: isDark ? 'text-white' : 'text-[var(--color-light-text-primary)]',
    secondary: isDark ? 'text-slate-400' : 'text-[var(--color-light-text-secondary)]',
    tertiary: isDark ? 'text-slate-500' : 'text-[var(--color-light-text-tertiary)]',
  };
  return variants[variant];
};

// Utilidad para fondos de hover
export const getHoverBgClass = (isDark) => 
  isDark 
    ? 'hover:bg-white/5' 
    : 'hover:bg-[var(--color-light-bg-tertiary)]';

// Utilidad para bordes según el modo
export const getBorderClass = (isDark, variant = 'default') => {
  const variants = {
    default: isDark ? 'border-white/10' : 'border-[var(--color-light-border)]',
    secondary: isDark ? 'border-white/5' : 'border-[var(--color-light-border-secondary)]',
  };
  return variants[variant];
};

// Utilidad para sombras según el modo
export const getShadowClass = (isDark, variant = 'default') => {
  const variants = {
    default: isDark 
      ? 'shadow-lg shadow-black/20' 
      : 'shadow-md shadow-slate-900/10',
    hover: isDark 
      ? 'hover:shadow-xl hover:shadow-black/30' 
      : 'hover:shadow-lg hover:shadow-slate-900/15',
  };
  return variants[variant];
};

// Card de habilidad específica - tamaño pequeño con hover
export const getSkillCardClass = (isDark) => 
  `rounded-xl p-4 transition-all duration-300 border group hover:scale-105 cursor-pointer ${
    isDark 
      ? `bg-white/[0.02] border-white/5 hover:border-[${COLORS.primary}]/40 hover:bg-white/[0.04]` 
      : `bg-[var(--color-light-bg-secondary)] border-[var(--color-light-border)] hover:border-[${COLORS.primary}]/40 hover:shadow-lg shadow-slate-900/5`
  }`;

// Pequeños inputs/badges dentro de cards
export const getSmallInputClass = (isDark) =>
  `w-full text-center rounded px-1 py-0.5 outline-none border text-[10px] transition-all ${
    isDark 
      ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500 focus:border-[#0078C8]/50' 
      : 'bg-[var(--color-light-bg-tertiary)] border-[var(--color-light-border)] text-[var(--color-light-text-primary)] placeholder-[var(--color-light-text-tertiary)] focus:border-[#0078C8]/50'
  }`;

// Para preview de imágenes/certificados
export const getPreviewImageClass = (isDark) =>
  `w-full h-20 object-cover rounded-lg border transition-all ${
    isDark 
      ? 'border-slate-700' 
      : 'border-[var(--color-light-border)] hover:border-[var(--color-light-border-secondary)]'
  }`;

// Para secciones de drag and drop
export const getDragOverClass = (isDark, isOver) =>
  `transition-all duration-200 ${
    isOver 
      ? (isDark ? 'bg-[#0078C8]/10 border-[#0078C8]' : 'bg-[#0078C8]/5 border-[#0078C8]')
      : ''
  }`;