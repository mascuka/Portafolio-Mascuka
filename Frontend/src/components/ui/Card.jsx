import { getCardClass } from '../../constants/styles';
import { useApp } from '../../context/AppContext';

/**
 * CARD REUTILIZABLE
 * Componente de tarjeta con efectos hover y variantes
 */
export default function Card({ 
  children, 
  onClick,
  hover = true,
  className = '',
  variant = 'default',
  ...props 
}) {
  const { isDark } = useApp();
  
  const isClickable = !!onClick;
  
  const variantClasses = {
    default: '',
    glass: isDark 
      ? 'backdrop-blur-xl bg-white/[0.03]' 
      : 'backdrop-blur-xl bg-white/80',
    gradient: isDark
      ? 'bg-gradient-to-br from-white/[0.03] to-white/[0.01]'
      : 'bg-gradient-to-br from-white to-slate-50'
  };
  
  return (
    <div
      className={`
        ${getCardClass(isDark)}
        ${variantClasses[variant]}
        ${className}
        ${isClickable ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${hover ? 'hover:-translate-y-1' : ''}
        transition-all duration-300
      `}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}