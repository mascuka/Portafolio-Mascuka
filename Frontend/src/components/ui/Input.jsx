import { getInputClass, getLabelClass } from '../../constants/styles';
import { useApp } from '../../context/AppContext';

export default function Input({ label, value, onChange, placeholder, type = 'text', helper }) {
  const { isDark } = useApp();
  
  return (
    <div className="space-y-2">
      {label && (
        <label className={getLabelClass(isDark)}>
          {label}
        </label>
      )}
      <input
        type={type}
        className={getInputClass(isDark)}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {helper && (
        <p className="text-[9px] text-slate-500">{helper}</p>
      )}
    </div>
  );
}