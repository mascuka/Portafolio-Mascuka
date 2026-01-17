import { getCardClass } from '../../constants/styles';
import { useApp } from '../../context/AppContext';

export default function Card({ children, className = '' }) {
  const { isDark } = useApp();
  
  return (
    <div className={`${getCardClass(isDark)} ${className}`}>
      {children}
    </div>
  );
}