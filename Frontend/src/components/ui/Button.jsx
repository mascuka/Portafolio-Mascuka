import { getButtonClass } from '../../constants/styles';
import { useApp } from '../../context/AppContext';

export default function Button({ children, variant = 'primary', onClick, disabled, className = '' }) {
  const { isDark } = useApp();
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${getButtonClass(isDark, variant)} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}