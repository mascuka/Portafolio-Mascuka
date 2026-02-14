import { getInputClass, getLabelClass } from '../../constants/styles';
import { useApp } from '../../context/AppContext';

/**
 * INPUT REUTILIZABLE
 * Componente de input con label, helper text, validaciones y estados
 * 
 * @param {string} label - Etiqueta del input
 * @param {string} value - Valor actual del input
 * @param {Function} onChange - Función a ejecutar cuando cambia el valor
 * @param {string} placeholder - Texto placeholder
 * @param {string} type - Tipo de input: 'text' | 'email' | 'password' | 'number' | 'url'
 * @param {string} helper - Texto de ayuda debajo del input
 * @param {string} error - Mensaje de error
 * @param {boolean} required - Campo obligatorio
 * @param {boolean} disabled - Deshabilitar el input
 * @param {ReactNode} icon - Ícono a mostrar dentro del input
 */
export default function Input({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  helper,
  error,
  required = false,
  disabled = false,
  icon,
  className = '',
  ...props 
}) {
  const { isDark } = useApp();
  
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label className={`${getLabelClass(isDark)} ${required ? "after:content-['*'] after:ml-1 after:text-red-500" : ''}`}>
          {label}
        </label>
      )}
      
      {/* Input container */}
      <div className="relative">
        {/* Ícono (si existe) */}
        {icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${
            isDark ? 'text-white/40' : 'text-slate-400'
          }`}>
            {icon}
          </div>
        )}
        
        {/* Input */}
        <input
          type={type}
          className={`
            ${getInputClass(isDark)} 
            ${icon ? 'pl-12' : ''}
            ${error ? (isDark ? 'border-red-500/50 focus:border-red-500' : 'border-red-500 focus:border-red-600') : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          {...props}
        />
      </div>
      
      {/* Helper text o error */}
      {(helper || error) && (
        <p className={`text-[9px] ${
          error 
            ? 'text-red-500 font-semibold' 
            : isDark ? 'text-slate-500' : 'text-slate-600'
        }`}>
          {error || helper}
        </p>
      )}
    </div>
  );
}