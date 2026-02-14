/**
 * PALETA DE COLORES UNIFICADA
 * Todos los colores de la aplicación centralizados aquí
 */

export const COLORS = {
  // Azul principal - Marca
  primary: '#0078C8',
  primaryHover: '#005A96',
  primaryLight: '#00A3FF',
  
  // Fondos
  darkBg: '#080B12',
  darkBgSecondary: '#0A0F1A',
  darkBgTertiary: '#0A0E14',
  lightBg: '#F5F7FA',
  lightBgSecondary: '#FAFBFC',
  
  // Transparencias (para usar con Tailwind)
  whiteAlpha5: 'rgba(255, 255, 255, 0.05)',
  whiteAlpha10: 'rgba(255, 255, 255, 0.1)',
  whiteAlpha20: 'rgba(255, 255, 255, 0.2)',
  
  // Estados
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // 🎨 TUS COLORES CUSTOM (agregados del tailwind.config)
  fondo: '#0B0E14',    // Negro profundo
  celeste: '#00F2FF',  // Celeste brillante
};

// Gradientes reutilizables
export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #0078C8 0%, #00A3FF 100%)',
  primarySubtle: 'linear-gradient(135deg, rgba(0, 120, 200, 0.1) 0%, rgba(0, 163, 255, 0.1) 100%)',
  darkOverlay: 'linear-gradient(180deg, rgba(8, 11, 18, 0) 0%, rgba(8, 11, 18, 0.8) 100%)',
};