import { useState } from 'react';
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
  const [formData, setFormData] = useState({ 
    title: '', company: '', period: '', description: '' 
  });
  const [headerData, setHeaderData] = useState({
    title: 'Experiencia',
    titleEN: 'Experience'
  });

  const experiences = data?.list || data || [];

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
    setFormData(experiences[index]);
    setEditIndex(index);
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
      const updatedList = experiences.filter((_, i) => i !== index);
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
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-24 xl:px-32 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div>
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none mb-3 transition-all duration-700 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {lang === 'ES' ? (data?.header?.title || 'Experiencia') : (data?.header?.titleEN || 'Experience')}
            </h1>
            <div className={`h-[2px] w-32 bg-gradient-to-r to-transparent ${
              isDark ? 'from-[#0078C8]' : 'from-[#0078C8]'
            }`} />
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <button 
                  onClick={addModal.open}
                  className={`px-6 py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 hover:-translate-y-0.5 border ${
                    isDark 
                      ? 'bg-[#0078C8] text-white border-[#0078C8] hover:bg-[#005A96] shadow-lg shadow-[#0078C8]/20'
                      : 'bg-[#0078C8] text-white border-[#0078C8] hover:bg-[#005A96] shadow-lg shadow-[#0078C8]/30'
                  }`}
                >
                  + Añadir
                </button>
                <button onClick={editHeaderModal.open} className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${isDark ? 'bg-white/5 text-white/40 hover:bg-[#0078C8]/20 hover:text-[#0078C8]' : 'bg-slate-100 text-slate-400 hover:bg-[#0078C8]/20 hover:text-[#0078C8]'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-0">
          {experiences.length === 0 && (
            <div className={`text-center py-32 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <p className="text-lg">No hay experiencias cargadas aún</p>
              {isAdmin && (
                <p className="text-sm mt-2 opacity-70">Haz click en "+ Añadir" para agregar tu primera experiencia</p>
              )}
            </div>
          )}

          {experiences.map((exp, i) => (
            <div key={i} className={`relative group mb-12 ${i !== experiences.length - 1 ? 'pb-12' : ''}`}>
              <div className={`rounded-2xl p-8 transition-all duration-500 border hover:-translate-y-1 ${
                isDark 
                  ? 'bg-white/[0.02] border-white/10 hover:border-[#0078C8]/30' 
                  : 'bg-white border-slate-200 hover:border-[#0078C8]/30 shadow-sm hover:shadow-lg'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-3 h-3 mt-2 rounded-full ${
                        isDark ? 'bg-[#0078C8]' : 'bg-[#0078C8]'
                      }`} style={{ 
                        boxShadow: isDark 
                          ? '0 0 20px rgba(0,120,200,0.5)' 
                          : '0 0 20px rgba(0,120,200,0.5)' 
                      }} />
                      
                      <div className="flex-1">
                        <h3 className={`text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {exp.title}
                        </h3>
                        <p className={`font-bold text-lg ${
                          isDark ? 'text-[#0078C8]' : 'text-[#0078C8]'
                        }`}>
                          {exp.company}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`leading-relaxed whitespace-pre-line pl-7 ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {exp.description}
                    </div>
                  </div>

                  <div className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold border ${
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
                    <button onClick={() => handleEdit(i)} className={`text-sm font-bold hover:scale-105 transition-transform ${
                      isDark ? 'text-[#0078C8]' : 'text-[#0078C8]'
                    }`}>
                      ✎ Editar
                    </button>
                    <button onClick={() => remove(i)} className="text-red-500 text-sm font-bold hover:scale-105 transition-transform ml-4">
                      ✕ Eliminar
                    </button>
                  </div>
                )}
              </div>

              {i !== experiences.length - 1 && (
                <div className={`absolute left-8 bottom-0 w-0.5 h-12 ${
                  isDark ? 'bg-gradient-to-b from-white/20 to-transparent' : 'bg-gradient-to-b from-slate-300 to-transparent'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

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