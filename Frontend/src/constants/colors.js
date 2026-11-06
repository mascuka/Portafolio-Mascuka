/**
 * 🌾 PALETA WARM/BEIGE
 * ❌ SIN blanco puro en cards
 * Tonos cálidos y profesionales tipo Notion
 */

export const COLORS = {
  // Acento MODO OSCURO "Grafito y azul niebla" - el único acento del tema
  primary: '#92C0E8',
  primaryHover: '#B5D5F0',
  primaryLight: '#92C0E8',
  
  // Fondos MODO OSCURO - grafito cálido; la banda es la franja de Proyectos
  darkBg: '#262624',
  darkBgSecondary: '#30302E',
  darkBgTertiary: '#2B2A28',
  darkBand: '#1E1D1C',
  
  // Fondos MODO CLARO "Marfil y arcilla": marfil de fondo, tarjetas blancas,
  // franja #F0EEE6 (Proyectos, píldoras, selector)
  lightBg: '#FAF9F5',
  lightBgSecondary: '#FFFFFF',
  lightBgTertiary: '#F0EEE6',

  // Textos MODO CLARO (todos ≥ 4.5:1 sobre marfil, blanco y franja)
  lightTextPrimary: '#141413',
  lightTextSecondary: '#5E5D59',
  lightTextTertiary: '#5E5D59',

  // Bordes MODO CLARO - líneas de 1px; la segunda es la de sobre la franja
  lightBorder: '#E8E6DC',
  lightBorderSecondary: '#E2DFD3',

  // Acento MODO CLARO - óxido para texto (subtítulo, navegación activa);
  // #D97757 (arcilla) es solo decorativo: anillo de la foto, líneas y puntos
  lightPrimary: '#B04A28',
  lightPrimaryHover: '#8F3B1F',
  lightPrimaryLight: '#D97757',
  lightPrimarySoft: '#F5E6DF',
  
  // Transparencias
  whiteAlpha5: 'rgba(255, 255, 255, 0.05)',
  whiteAlpha10: 'rgba(255, 255, 255, 0.1)',
  whiteAlpha20: 'rgba(255, 255, 255, 0.2)',
  
  // Estados
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Custom
  fondo: '#0B0E14',
  celeste: '#00F2FF',
};

export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #0078C8 0%, #00A3FF 100%)',
  primarySubtle: 'linear-gradient(135deg, rgba(0, 120, 200, 0.1) 0%, rgba(0, 163, 255, 0.1) 100%)',
  darkOverlay: 'linear-gradient(180deg, rgba(8, 11, 18, 0) 0%, rgba(8, 11, 18, 0.8) 100%)',
  lightOverlay: 'linear-gradient(180deg, rgba(250, 249, 245, 0) 0%, rgba(250, 249, 245, 0.95) 100%)',
  lightSubtle: 'linear-gradient(135deg, rgba(240, 238, 230, 0.9) 0%, rgba(250, 249, 245, 0.9) 100%)',
  lightGlow: 'linear-gradient(135deg, rgba(184, 90, 55, 0.05) 0%, transparent 100%)',
};