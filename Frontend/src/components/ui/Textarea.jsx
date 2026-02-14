import { getTextareaClass, getLabelClass } from '../../constants/styles';
import { useApp } from '../../context/AppContext';

/**
 * TEXTAREA REUTILIZABLE
 * Componente de textarea con label, helper text, contador de caracteres y validaciones
 */
export default function Textarea({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  rows = 4, 
  helper,
  error,
  required = false,
  disabled = false,
  maxLength,
  showCounter = false,
  className = '',
  ...props 
}) {
  const { isDark } = useApp();
  
  const currentLength = value?.length || 0;
  const showCharCounter = showCounter || maxLength;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label con contador */}
      <div className="flex items-center justify-between">
        {label && (
          <label className={`${getLabelClass(isDark)} ${required ? "after:content-['*'] after:ml-1 after:text-red-500" : ''}`}>
            {label}
          </label>
        )}
        
        {/* Contador de caracteres */}
        {showCharCounter && (
          <span className={`text-[9px] font-medium ${
            maxLength && currentLength > maxLength * 0.9
              ? 'text-red-500'
              : isDark ? 'text-slate-500' : 'text-slate-600'
          }`}>
            {currentLength}{maxLength ? `/${maxLength}` : ''}
          </span>
        )}
      </div>
      
      {/* Textarea */}
      <textarea
        className={`
          ${getTextareaClass(isDark)}
          ${error ? (isDark ? 'border-red-500/50 focus:border-red-500' : 'border-red-500 focus:border-red-600') : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        {...props}
      />
      
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