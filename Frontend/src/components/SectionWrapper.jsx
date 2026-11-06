import { useApp } from '../context/useApp';
import { COLORS } from '../constants/colors';

/**
 * SECTION WRAPPER REFACTORIZADO
 * Envuelve secciones con backgrounds y efectos consistentes
 * `banda` pinta la franja de borde a borde (Proyectos) y `sinLinea` quita
 * el divisor superior; fondos planos en los dos modos
 */
export default function SectionWrapper({ children, id, banda = false, sinLinea = false }) {
  const { isDark } = useApp();

  // Estilos computados
  const bgColor = isDark
    ? (banda ? COLORS.darkBand : COLORS.darkBg)
    : (banda ? COLORS.lightBgTertiary : COLORS.lightBg);

  return (
    <section
      id={id}
      className="claro-seccion min-h-screen py-20 pt-20 relative overflow-hidden transition-colors duration-700"
      style={{ backgroundColor: bgColor }}
    >
      {/* Separador superior: línea fina de 1px con el color de borde del tema */}
      {!banda && !sinLinea && (
        <div className="absolute top-0 left-0 right-0 h-px bg-[var(--tema-linea)]" />
      )}

      {children}
    </section>
  );
}
