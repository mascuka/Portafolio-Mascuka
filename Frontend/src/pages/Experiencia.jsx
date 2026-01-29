import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useModal } from '../hooks/useModal';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import SectionWrapper from '../components/SectionWrapper';

export default function Experiencia({ data, onUpdate }) {
  const { isDark, isAdmin, lang } = useApp();
  const addModal = useModal();
  const editModal = useModal();
  const editHeaderModal = useModal();
  const [editIndex, setEditIndex] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [formData, setFormData] = useState({ 
    title: '', company: '', period: '', description: '' 
  });
  const [headerData, setHeaderData] = useState({
    title: 'Experiencia',
    titleEN: 'Experience'
  });

  const experiences = data?.list || data || [];

  // Función para detectar si es "presente" o "actual"
  const isCurrentJob = (period) => {
    if (!period) return false;
    const periodLower = period.toLowerCase();
    return periodLower.includes('presente') || periodLower.includes('actual') || 
           periodLower.includes('present') || periodLower.includes('current');
  };

  // Función para extraer el año de inicio
  const getStartYear = (period) => {
    if (!period) return 0;
    const match = period.match(/(\d{4})/);
    return match ? parseInt(match[1]) : 0;
  };

  // Ordenar experiencias: primero "presente", luego por año más reciente
  const sortedExperiences = [...experiences].sort((a, b) => {
    const aIsCurrent = isCurrentJob(a.period);
    const bIsCurrent = isCurrentJob(b.period);
    
    // Si uno es actual y el otro no, el actual va primero
    if (aIsCurrent && !bIsCurrent) return -1;
    if (!aIsCurrent && bIsCurrent) return 1;
    
    // Si ambos son actuales o ninguno es actual, ordenar por año
    const aYear = getStartYear(a.period);
    const bYear = getStartYear(b.period);
    return bYear - aYear; // Más reciente primero
  });

  // Siempre mostrar máximo 2 experiencias
  const currentExperience = sortedExperiences[0];
  const otherExperiences = sortedExperiences.slice(1);
  const needsCarousel = otherExperiences.length > 1;

  useEffect(() => {
    if (currentIndex >= otherExperiences.length && otherExperiences.length > 0) {
      setCurrentIndex(0);
    }
  }, [otherExperiences.length, currentIndex]);

  const handleNavigation = (direction) => {
    if (isTransitioning || otherExperiences.length <= 1) return;
    
    setIsTransitioning(true);
    
    if (direction === 'next') {
      setCurrentIndex((prev) => (prev + 1) % otherExperiences.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + otherExperiences.length) % otherExperiences.length);
    }
    
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleAdd = () => {
    if (!formData.title || !formData.company || !formData.period) {
      return alert("Completa los campos obligatorios");
    }
    const updatedList = Array.isArray(experiences) ? [...experiences, formData] : [formData];
    onUpdate({ list: updatedList, header: data?.header || headerData });
    setFormData({ title: '', company: '', period: '', description: '' });
    addModal.close();
  };

  const handleEdit = (index) => {
    const expToEdit = sortedExperiences[index];
    const originalIndex = experiences.findIndex(exp => 
      exp.title === expToEdit.title && 
      exp.company === expToEdit.company && 
      exp.period === expToEdit.period
    );
    setFormData(experiences[originalIndex]);
    setEditIndex(originalIndex);
    editModal.open();
  };

  const handleUpdate = () => {
    const updated = [...experiences];
    updated[editIndex] = formData;
    onUpdate({ list: updated, header: data?.header || headerData });
    setFormData({ title: '', company: '', period: '', description: '' });
    setEditIndex(null);
    editModal.close();
  };

  const remove = (index) => {
    if (window.confirm("¿Eliminar experiencia?")) {
      const expToRemove = sortedExperiences[index];
      const originalIndex = experiences.findIndex(exp => 
        exp.title === expToRemove.title && 
        exp.company === expToRemove.company && 
        exp.period === expToRemove.period
      );
      const updatedList = experiences.filter((_, i) => i !== originalIndex);
      onUpdate({ list: updatedList, header: data?.header || headerData });
    }
  };

  const handleSaveHeader = async () => {
    const updatedHeader = { ...headerData, titleEN: headerData.title };
    await onUpdate({ list: experiences, header: updatedHeader });
    editHeaderModal.close();
  };

  const resetForm = () => {
    setFormData({ title: '', company: '', period: '', description: '' });
    setEditIndex(null);
  };

  return (
    <SectionWrapper id="Experiencia">
      <div className="w-full max-w-[1600px] mx-auto px-10 sm:px-6 md:px-12 lg:px-20 relative z-10">
        
        {/* HEADER CENTRADO - MISMO TAMAÑO QUE HABILIDADES */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-20 relative">
          <div className="text-center">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none mb-3 transition-all duration-700 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {lang === 'ES' ? (data?.header?.title || 'Experiencia') : (data?.header?.titleEN || 'Experience')}
            </h1>
            <div className={`h-[2px] w-32 sm:w-40 bg-gradient-to-r from-transparent via-[#0078C8] to-transparent mx-auto`} />
          </div>
          
          {isAdmin && (
            <div className="absolute right-0 flex items-center gap-2">
              <button 
                onClick={addModal.open}
                className="px-3 sm:px-4 py-2 rounded-lg text-[8px] sm:text-[9px] font-bold uppercase tracking-wider transition-all bg-[#0078C8] text-white hover:bg-[#005A96] opacity-60 hover:opacity-100"
              >
                + Nuevo
              </button>
              <button 
                onClick={editHeaderModal.open} 
                className={`p-2 rounded-lg transition-all opacity-60 hover:opacity-100 ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-white/60' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* CONTENIDO */}
        <div className="space-y-0">
          {sortedExperiences.length === 0 && (
            <div className={`text-center py-20 sm:py-32 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <p className="text-base sm:text-lg">No hay experiencias cargadas aún</p>
              {isAdmin && (
                <p className="text-sm mt-2 opacity-70">Haz click en "+ Nuevo" para agregar tu primera experiencia</p>
              )}
            </div>
          )}

          {/* EXPERIENCIA ACTUAL - SIEMPRE VISIBLE */}
          {currentExperience && (
            <ExperienceCard 
              exp={currentExperience}
              index={0}
              isDark={isDark}
              isAdmin={isAdmin}
              onEdit={() => handleEdit(0)}
              onRemove={() => remove(0)}
              showConnector={otherExperiences.length > 0}
            />
          )}

          {/* OTRAS EXPERIENCIAS - CARRUSEL SI HAY MÁS DE 1 */}
          {otherExperiences.length > 0 && (
            <div className="relative">
              {needsCarousel && (
                <>
                  <button 
                    onClick={() => handleNavigation('prev')} 
                    disabled={isTransitioning}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 z-30 w-9 h-9 sm:w-10 sm:h-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 flex disabled:opacity-30 disabled:cursor-not-allowed ${
                      isDark ? 'bg-[#0078C8] text-white shadow-lg shadow-[#0078C8]/30' : 'bg-[#0078C8] text-white shadow-lg'
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleNavigation('next')} 
                    disabled={isTransitioning}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 z-30 w-9 h-9 sm:w-10 sm:h-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 flex disabled:opacity-30 disabled:cursor-not-allowed ${
                      isDark ? 'bg-[#0078C8] text-white shadow-lg shadow-[#0078C8]/30' : 'bg-[#0078C8] text-white shadow-lg'
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              <div className="overflow-hidden py-2">
                <div 
                  className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-out' : ''}`}
                  style={{
                    transform: `translateX(-${currentIndex * 100}%)`
                  }}
                >
                  {otherExperiences.map((exp, i) => (
                    <div key={i} className="w-full flex-shrink-0">
                      <ExperienceCard 
                        exp={exp}
                        index={i + 1}
                        isDark={isDark}
                        isAdmin={isAdmin}
                        onEdit={() => handleEdit(i + 1)}
                        onRemove={() => remove(i + 1)}
                        showConnector={false}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {needsCarousel && (
                <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8">
                  {otherExperiences.map((_, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => {
                        if (currentIndex !== idx && !isTransitioning) {
                          setIsTransitioning(true);
                          setCurrentIndex(idx);
                          setTimeout(() => setIsTransitioning(false), 500);
                        }
                      }} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentIndex === idx
                          ? 'bg-[#0078C8] w-8' 
                          : (isDark ? 'bg-white/10 w-2 hover:w-3 hover:bg-white/20' : 'bg-slate-200 w-2 hover:w-3 hover:bg-slate-300')
                      }`} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODALES */}
      <Modal isOpen={editHeaderModal.isOpen} onClose={editHeaderModal.close} title="Editar Título">
        <div className="space-y-6">
          <Input
            label="Título (Español)"
            value={headerData.title}
            onChange={(e) => setHeaderData({...headerData, title: e.target.value})}
            helper="Se traducirá automáticamente al inglés"
          />
          <Button onClick={handleSaveHeader} className="w-full">Guardar</Button>
        </div>
      </Modal>

      <Modal 
        isOpen={addModal.isOpen} 
        onClose={() => { addModal.close(); resetForm(); }}
        title="Nueva Experiencia"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Cargo / Puesto *"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Ej: Desarrollador Full Stack..."
            />
            <Input
              label="Empresa / Organización *"
              value={formData.company}
              onChange={e => setFormData({...formData, company: e.target.value})}
              placeholder="Ej: Tech Solutions..."
            />
          </div>

          <Input
            label="Período *"
            value={formData.period}
            onChange={e => setFormData({...formData, period: e.target.value})}
            placeholder="Ej: 2023 - Presente, 2020 - 2023..."
            helper="💡 Usa 'Presente' o 'Actual' para tu trabajo actual"
          />

          <Textarea
            label="Descripción"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Describe tus responsabilidades y logros...&#10;&#10;Ejemplo:&#10;• Desarrollé 5 aplicaciones web&#10;• Lideré equipo de 3 personas&#10;• Implementé metodologías ágiles"
            rows={6}
            helper="💡 Tip: Usa Enter para separar líneas. Usa • o - para hacer listas"
          />

          <div className="flex gap-4">
            <Button onClick={handleAdd} className="flex-1">
              Guardar
            </Button>
            <Button onClick={() => { addModal.close(); resetForm(); }} variant="secondary" className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={editModal.isOpen} 
        onClose={() => { editModal.close(); resetForm(); }}
        title="Editar Experiencia"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Cargo / Puesto *"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
            <Input
              label="Empresa / Organización *"
              value={formData.company}
              onChange={e => setFormData({...formData, company: e.target.value})}
            />
          </div>

          <Input
            label="Período *"
            value={formData.period}
            onChange={e => setFormData({...formData, period: e.target.value})}
            helper="💡 Usa 'Presente' o 'Actual' para tu trabajo actual"
          />

          <Textarea
            label="Descripción"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            rows={6}
          />

          <div className="flex gap-4">
            <Button onClick={handleUpdate} className="flex-1">
              Actualizar
            </Button>
            <Button onClick={() => { editModal.close(); resetForm(); }} variant="secondary" className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </SectionWrapper>
  );
}

// Componente para cada card de experiencia
function ExperienceCard({ exp, index, isDark, isAdmin, onEdit, onRemove, showConnector }) {
  return (
    <div className={`relative group mb-8 ${showConnector ? 'pb-8' : ''}`}>
      <div className={`rounded-2xl p-6 sm:p-8 transition-all duration-500 border hover:-translate-y-1 ${
        isDark 
          ? 'bg-white/[0.02] border-white/10 hover:border-[#0078C8]/30' 
          : 'bg-white border-slate-200 hover:border-[#0078C8]/30 shadow-sm hover:shadow-lg'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
          <div className="flex-1 space-y-3 sm:space-y-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={`flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3 mt-1.5 sm:mt-2 rounded-full ${
                isDark ? 'bg-[#0078C8]' : 'bg-[#0078C8]'
              }`} style={{ 
                boxShadow: isDark 
                  ? '0 0 20px rgba(0,120,200,0.5)' 
                  : '0 0 20px rgba(0,120,200,0.5)' 
              }} />
              
              <div className="flex-1">
                <h3 className={`text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight mb-1.5 sm:mb-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {exp.title}
                </h3>
                <p className={`font-bold text-base sm:text-lg ${
                  isDark ? 'text-[#0078C8]' : 'text-[#0078C8]'
                }`}>
                  {exp.company}
                </p>
              </div>
            </div>
            
            <div className={`leading-relaxed whitespace-pre-line pl-0 sm:pl-7 text-sm sm:text-base ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {exp.description}
            </div>
          </div>

          <div className={`flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold border ${
            isDark 
              ? 'bg-white/5 text-slate-400 border-white/10' 
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {exp.period}
          </div>
        </div>

        {isAdmin && (
          <div className={`flex gap-4 mt-6 pt-6 border-t opacity-0 group-hover:opacity-100 transition-opacity ${
            isDark ? 'border-white/5' : 'border-slate-200'
          }`}>
            <button onClick={onEdit} className={`text-xs sm:text-sm font-bold hover:scale-105 transition-transform ${
              isDark ? 'text-[#0078C8]' : 'text-[#0078C8]'
            }`}>
              ✎ Editar
            </button>
            <button onClick={onRemove} className="text-red-500 text-xs sm:text-sm font-bold hover:scale-105 transition-transform ml-4">
              ✕ Eliminar
            </button>
          </div>
        )}
      </div>

      {showConnector && (
        <div className={`absolute left-6 sm:left-8 bottom-0 w-0.5 h-8 ${
          isDark ? 'bg-gradient-to-b from-white/20 to-transparent' : 'bg-gradient-to-b from-slate-300 to-transparent'
        }`} />
      )}
    </div>
  );
}