import { getTextareaClass, getLabelClass } from '../../constants/styles';
import { useApp } from '../../context/AppContext';

export default function Textarea({ label, value, onChange, placeholder, rows = 4, helper }) {
  const { isDark } = useApp();
  
  return (
    <div className="space-y-2">
      {label && (
        <label className={getLabelClass(isDark)}>
          {label}
        </label>
      )}
      <textarea
        className={`${getTextareaClass(isDark)} h-${rows * 8}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
      {helper && (
        <p className="text-[9px] text-slate-500">{helper}</p>
      )}
    </div>
  );
}