import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useModal } from '../hooks/useModal';
import { useCloudinary } from '../hooks/useCloudinary';
import { useTranslate } from '../hooks/useTranslate';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import SectionWrapper from '../components/SectionWrapper';

export default function Proyectos({ projects, onUpdate }) {
  const { isDark, lang, isAdmin } = useApp();
  const addModal = useModal();
  const editHeaderModal = useModal();
  const { uploadImage, deleteImage, uploading } = useCloudinary();
  const { translateMultiple } = useTranslate();
  
  const [editingId, setEditingId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageType, setImageType] = useState('upload');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    image: '', 
    imageFile: null,
    imagePublicId: '',
    imageUrl: '',
    demo: '',
    order: null 
  });
  
  const [headerData, setHeaderData] = useState({ 
    title: 'Proyectos',
    titleEN: 'Projects'
  });

  useEffect(() => {
    if (projects?.header) {
      setHeaderData(projects.header);
    }
  }, [projects]);

  const projectsList = Array.isArray(projects?.list || projects) ? (projects?.list || projects) : [];
  
  const sortedProjects = [...projectsList].sort((a, b) => {
    const orderA = a.order !== null && a.order !== undefined ? a.order : Infinity;
    const orderB = b.order !== null && b.order !== undefined ? b.order : Infinity;
    return orderA - orderB;
  });

  const handleNavigation = (direction) => {
    if (isTransitioning || sortedProjects.length === 0) return;
    setIsTransitioning(true);

    const total = sortedProjects.length;
    const isMobile = window.innerWidth < 768;
    const step = isMobile ? 1 : (total >= 3 ? 3 : 1);
    
    if (direction === 'next') {
      setCurrentIndex(prev => prev + step);
    } else {
      setCurrentIndex(prev => prev - step);
    }

    setTimeout(() => {
      setIsTransitioning(false);
      setCurrentIndex(prev => {
        if (prev >= total) return prev - total;
        if (prev < 0) return prev + total;
        return prev;
      });
    }, 500); 
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleUrlScreenshot = () => {
    if (!formData.imageUrl) {
      alert('Por favor ingresa una URL válida');
      return;
    }
    const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(formData.imageUrl)}&screenshot=true&meta=false&embed=screenshot.url`;
    setFormData(prev => ({ ...prev, image: screenshotUrl, imageFile: null }));
  };

  const getAvailableOrders = () => {
    const usedOrders = projectsList
      .filter(p => editingId ? p.id !== editingId : true)
      .map(p => p.order)
      .filter(o => o !== null && o !== undefined);
    
    const maxOrder = Math.max(...usedOrders, projectsList.length);
    const orders = [];
    for (let i = 1; i <= maxOrder + 1; i++) {
      orders.push(i);
    }
    return orders;
  };

  const getRandomUnusedOrder = () => {
    const usedOrders = projectsList.map(p => p.order).filter(o => o !== null && o !== undefined);
    const availableOrders = getAvailableOrders().filter(o => !usedOrders.includes(o));
    return availableOrders[Math.floor(Math.random() * availableOrders.length)] || projectsList.length + 1;
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({ 
      title: project.title || '', 
      description: project.description || '', 
      image: project.image || '', 
      imageFile: null,
      imagePublicId: project.imagePublicId || '',
      imageUrl: '',
      demo: project.demo || '',
      order: project.order !== null && project.order !== undefined ? project.order : null
    });
    setImageType('upload');
    addModal.open();
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ 
      title: '', 
      description: '', 
      image: '', 
      imageFile: null,
      imagePublicId: '',
      imageUrl: '',
      demo: '', 
      order: null 
    });
    setImageType('upload');
    addModal.open();
  };

  const handleSave = async () => {
    try {
      let imageUrl = formData.image;
      let imagePublicId = formData.imagePublicId;
      
      if (formData.imageFile) {
        if (editingId) {
          const oldProject = projectsList.find(p => p.id === editingId);
          if (oldProject?.imagePublicId) {
            await deleteImage(oldProject.imagePublicId);
          }
        }
        const result = await uploadImage(formData.imageFile, 'portfolio/projects');
        imageUrl = result.secure_url;
        imagePublicId = result.public_id;
      }

      const [tEN, dEN] = await translateMultiple([formData.title, formData.description]);
      const finalOrder = formData.order !== null && formData.order !== undefined 
        ? parseInt(formData.order)
        : getRandomUnusedOrder();

      let updatedProjects;
      if (editingId) {
        updatedProjects = projectsList.map(p => 
          p.id === editingId 
            ? { 
                ...p, 
                title: formData.title, 
                description: formData.description, 
                image: imageUrl,
                imagePublicId: imagePublicId,
                demo: formData.demo, 
                titleEN: tEN, 
                descriptionEN: dEN,
                order: finalOrder
              }
            : p
        );
      } else {
        updatedProjects = [...projectsList, { 
          title: formData.title, 
          description: formData.description, 
          image: imageUrl,
          imagePublicId: imagePublicId,
          demo: formData.demo, 
          titleEN: tEN, 
          descriptionEN: dEN, 
          id: Date.now().toString(),
          order: finalOrder
        }];
      }

      await onUpdate({ list: updatedProjects, header: headerData });
      addModal.close();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el proyecto');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este proyecto?')) {
      const project = projectsList.find(p => p.id === id);
      if (project?.imagePublicId) {
        await deleteImage(project.imagePublicId);
      }
      await onUpdate({ list: projectsList.filter(p => p.id !== id), header: headerData });
    }
  };

  const handleSaveHeader = async () => {
    const [titleEN] = await translateMultiple([headerData.title]);
    const updatedHeader = { ...headerData, titleEN };
    setHeaderData(updatedHeader);
    await onUpdate({ list: projectsList, header: updatedHeader });
    editHeaderModal.close();
  };

  return (
    <SectionWrapper id="Proyectos">
      <div className="relative w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-24 xl:px-32 z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div>
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none mb-3 transition-all duration-700 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {lang === 'ES' ? headerData.title : (headerData.titleEN || headerData.title)}
            </h1>
            <div className={`h-[2px] w-32 bg-gradient-to-r to-transparent ${isDark ? 'from-[#0078C8]' : 'from-[#0078C8]'}`} />
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <Button onClick={handleAdd}>+ Nuevo</Button>
                <button onClick={editHeaderModal.open} className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${isDark ? 'bg-white/5 text-white/40 hover:bg-[#0078C8]/20 hover:text-[#0078C8]' : 'bg-slate-100 text-slate-400 hover:bg-[#0078C8]/20 hover:text-[#0078C8]'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              </>
            )}
          </div>
        </div>

        {projectsList.length === 0 ? (
          <div className={`text-center py-32 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <p className="text-lg">No hay proyectos cargados aún</p>
          </div>
        ) : (
          <div className="relative group/carousel">
            {/* Flechas de Navegación */}
            {sortedProjects.length > 0 && (
              <>
                <button 
                  onClick={() => handleNavigation('prev')} 
                  className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-30 w-12 h-12 items-center justify-center rounded-full transition-all duration-500 hover:scale-110 flex ${isDark ? 'bg-[#0078C8] text-white shadow-lg shadow-[#0078C8]/30' : 'bg-[#0078C8] text-white shadow-lg'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button 
                  onClick={() => handleNavigation('next')} 
                  className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-30 w-12 h-12 items-center justify-center rounded-full transition-all duration-500 hover:scale-110 flex ${isDark ? 'bg-[#0078C8] text-white shadow-lg shadow-[#0078C8]/30' : 'bg-[#0078C8] text-white shadow-lg'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}

            <div className="overflow-hidden w-full">
              <div 
                className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`} 
                style={{ 
                  transform: `translateX(-${(sortedProjects.length + currentIndex) * (100 / (window.innerWidth < 768 ? 1 : 3))}%)` 
                }}
              >
                {[...sortedProjects, ...sortedProjects, ...sortedProjects].map((project, idx) => (
                  <div 
                    key={`${project.id}-${idx}`} 
                    className="w-full md:w-1/3 flex-shrink-0 px-4"
                  >
                    <ProjectCard 
                      project={project}
                      isDark={isDark}
                      lang={lang}
                      isAdmin={isAdmin}
                      onEdit={() => handleEdit(project)}
                      onDelete={() => handleDelete(project.id)}
                      isMobile={window.innerWidth < 768}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Indicators */}
            <div className="flex justify-center items-center gap-2 mt-8">
              {sortedProjects.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => {
                    if (currentIndex !== idx) {
                        setIsTransitioning(true);
                        setCurrentIndex(idx);
                        setTimeout(() => setIsTransitioning(false), 500);
                    }
                  }} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    (currentIndex % sortedProjects.length + sortedProjects.length) % sortedProjects.length === idx 
                      ? 'bg-[#0078C8] w-8' 
                      : (isDark ? 'bg-white/10 w-2' : 'bg-slate-200 w-2')
                  }`} 
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
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

      <Modal isOpen={addModal.isOpen} onClose={addModal.close} title={editingId ? 'Editar Proyecto' : 'Nuevo Proyecto'}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-2">
          <Input
            label="Título (Español)"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            helper="Se traducirá automáticamente al inglés"
          />
          
          <Textarea
            label="Descripción (Español)"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            helper="Se traducirá automáticamente al inglés"
          />
          
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#0078C8]' : 'text-[#0078C8]'}`}>
              Imagen del Proyecto
            </label>
            <div className="flex gap-2">
              <button onClick={() => setImageType('upload')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${imageType === 'upload' ? 'bg-[#0078C8] text-white' : isDark ? 'bg-white/5 text-white/60' : 'bg-slate-100 text-slate-600'}`}>📤 Subir</button>
              <button onClick={() => setImageType('url')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${imageType === 'url' ? 'bg-[#0078C8] text-white' : isDark ? 'bg-white/5 text-white/60' : 'bg-slate-100 text-slate-600'}`}>🌐 URL Web</button>
            </div>
          </div>

          {imageType === 'upload' ? (
            <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${isDark ? 'border-white/10 hover:border-[#0078C8]/40 bg-white/5' : 'border-slate-200 hover:border-[#0078C8]/40 bg-slate-50'}`}>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="project-image" />
              <label htmlFor="project-image" className="cursor-pointer">
                {formData.image ? <img src={formData.image} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" /> : <div className="py-4"><p className={`text-xs ${isDark ? 'text-white/60' : 'text-slate-600'}`}>Click para seleccionar</p></div>}
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                label="URL de la Web / Proyecto"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                placeholder="https://tu-proyecto.com"
                helper="Obtendremos una captura automática de la web"
              />
              <button onClick={handleUrlScreenshot} disabled={!formData.imageUrl} className={`w-full py-3 px-4 rounded-lg text-xs font-bold transition-all ${!formData.imageUrl ? 'bg-slate-300 text-slate-500' : 'bg-[#0078C8] text-white hover:bg-[#005A96]'}`}>📸 Capturar Pantalla</button>
              {formData.image && <img src={formData.image} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-[#0078C8]/30" />}
            </div>
          )}
          
          <Input label="URL del Demo" value={formData.demo} onChange={(e) => setFormData({...formData, demo: e.target.value})} placeholder="https://..." />

          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#0078C8]' : 'text-[#0078C8]'}`}>Orden</label>
            <select value={formData.order || ''} onChange={(e) => setFormData({...formData, order: e.target.value ? parseInt(e.target.value) : null})} className={`w-full p-3 rounded-xl border-2 outline-none transition-all text-sm ${isDark ? 'bg-[#0F172A] border-white/10 text-white focus:border-[#0078C8]' : 'bg-white border-slate-200 text-slate-900 focus:border-[#0078C8]'}`}>
              <option value="">Aleatorio</option>
              {getAvailableOrders().map(order => <option key={order} value={order}>Posición {order}</option>)}
            </select>
          </div>
          
          <Button onClick={handleSave} disabled={uploading} className="w-full mt-6">{uploading ? 'GUARDANDO...' : 'GUARDAR PROYECTO'}</Button>
        </div>
      </Modal>
    </SectionWrapper>
  );
}

function ProjectCard({ project, isDark, lang, isAdmin, onEdit, onDelete, isMobile = false }) {
  return (
    <div className="group relative h-full">
      <div className={`absolute inset-0 blur-[80px] opacity-0 group-hover:opacity-20 transition-all duration-1000 ${isDark ? 'bg-[#0078C8]' : 'bg-[#0078C8]/50'}`} />
      
      <div className={`relative h-full flex flex-col rounded-3xl border overflow-hidden transition-all duration-700 ${isDark ? 'bg-[#0F172A]/40 backdrop-blur-sm border-white/5 group-hover:border-[#0078C8]/40 shadow-2xl shadow-black/50' : 'bg-white border-slate-200 shadow-xl group-hover:border-[#0078C8]/40'}`}>
        
        <div className="relative aspect-[16/10] overflow-hidden">
          {project.image && <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" />}
          <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-700 ${isDark ? 'from-[#0F172A] via-[#0F172A]/60 to-transparent opacity-60 group-hover:opacity-40' : 'from-white via-white/60 to-transparent opacity-40 group-hover:opacity-20'}`} />
        </div>

        <div className={`${isMobile ? 'p-5' : 'p-6 md:p-8'} flex flex-col flex-1`}>
          <h4 className={`${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'} font-black tracking-tight mb-3 leading-tight transition-colors duration-300 ${isDark ? 'text-white group-hover:text-[#0078C8]' : 'text-slate-900 group-hover:text-[#0078C8]'}`}>
            {lang === 'ES' ? project.title : (project.titleEN || project.title)}
          </h4>
          
          <p className={`${isMobile ? 'text-sm' : 'text-sm md:text-base'} leading-relaxed mb-6 line-clamp-3 transition-colors duration-700 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'ES' ? project.description : (project.descriptionEN || project.description)}
          </p>

          <div className={`w-12 h-[2px] mb-6 transition-all duration-500 bg-gradient-to-r from-[#0078C8] to-transparent group-hover:w-24`} />

          <div className="mt-auto flex items-center gap-3">
            <a href={project.demo} target="_blank" rel="noopener noreferrer" className={`flex-1 py-3 px-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300 flex items-center justify-center gap-2 group/btn bg-[#0078C8] text-white hover:bg-[#005A96] shadow-lg shadow-[#0078C8]/20`}>
              {lang === 'ES' ? 'Ver Web' : 'View Site'}
              <svg className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </a>
            
            {isAdmin && (
              <div className="flex gap-2">
                <button onClick={onEdit} className="p-3 rounded-xl transition-all duration-300 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onClick={onDelete} className="p-3 rounded-xl transition-all duration-300 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}