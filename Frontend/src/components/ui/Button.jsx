import { getButtonClass } from '../../constants/styles';
import { useApp } from '../../context/AppContext';

/**
 * BOTÓN REUTILIZABLE
 * Componente de botón con múltiples variantes y estados
 * 
 * @param {ReactNode} children - Contenido del botón
 * @param {string} variant - Variante del botón: 'primary' | 'secondary' | 'icon' | 'ghost'
 * @param {Function} onClick - Función a ejecutar al hacer click
 * @param {boolean} disabled - Deshabilitar el botón
 * @param {boolean} loading - Mostrar estado de carga
 * @param {string} className - Clases CSS adicionales
 * @param {string} type - Tipo de botón: 'button' | 'submit' | 'reset'
 */
export default function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  ...props 
}) {
  const { isDark } = useApp();
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      type={type}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      className={`
        ${getButtonClass(isDark, variant)} 
        ${className}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        relative
      `}
      {...props}
    >
      {/* Spinner de carga */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Contenido del botón (oculto cuando está cargando) */}
      <span className={loading ? 'opacity-0' : ''}>
        {children}
      </span>
    </button>
  );
}