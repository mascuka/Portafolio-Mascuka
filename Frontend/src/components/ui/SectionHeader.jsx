import { useApp } from '../../context/AppContext';
import Button from './Button';

export default function SectionHeader({ badge, title, onAction, actionLabel }) {
  const { isDark } = useApp();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
      <div>
        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-sm border mb-4 ${
          isDark ? 'bg-[#00A3FF]/10 border-[#00A3FF]/30' : 'bg-[#0078C8]/15 border-[#0078C8]/50'
        }`}>
          <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${
            isDark ? 'text-[#00A3FF]' : 'text-[#005A96]'
          }`}>
            {badge}
          </span>
        </div>
        
        <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none mb-3 transition-all duration-700 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {title}
        </h1>
        
        <div className={`h-[2px] w-16 bg-gradient-to-r to-transparent ${
          isDark ? 'from-[#00A3FF]' : 'from-[#0078C8]'
        }`} />
      </div>
      
      {onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}