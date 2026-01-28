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
  const imageViewModal = useModal();
  const { uploadImage, deleteImage, uploading } = useCloudinary();
  const { translateMultiple } = useTranslate();
  
  const [editingId, setEditingId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState(''); // 'next' o 'prev'
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    images: [],
    imageFiles: [],
    imagePublicIds: [],
    demo: '',
    order: null 
  });
  
  const [headerData, setHeaderData] = useState({ 
    title: 'Proyectos',
    titleEN: 'Projects',
    rows: 1
  });

  useEffect(() => {
    if (projects?.header) {
      setHeaderData(projects.header);
    }
  }, [projects]);

  // Escuchar cambios de tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setCurrentIndex(0); // Reset del índice al cambiar de tamaño
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const projectsList = Array.isArray(projects?.list || projects) ? (projects?.list || projects) : [];
  
  const sortedProjects = [...projectsList].sort((a, b) => {
    const orderA = a.order !== null && a.order !== undefined ? a.order : Infinity;
    const orderB = b.order !== null && b.order !== undefined ? b.order : Infinity;
    return orderA - orderB;
  });

  const rows = headerData.rows || 1;
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  
  const cardsPerRow = isMobile ? 1 : isTablet ? 2 : 5;
  const totalVisible = cardsPerRow * rows;
  const needsCarousel = sortedProjects.length > totalVisible;

  // MEJORA: Agrupar por columnas de N filas
  const groupedProjects = [];
  for (let i = 0; i < sortedProjects.length; i += rows) {
    groupedProjects.push(sortedProjects.slice(i, i + rows));
  }

  // MEJORA: Duplicar grupos para infinito sin rebobinar
  const displayGroups = needsCarousel ? [...groupedProjects, ...groupedProjects] : groupedProjects;

  const handleNavigation = (direction) => {
    if (isTransitioning || !needsCarousel) return;
    
    setIsTransitioning(true);
    // MEJORA: Mover por bloque (cantidad de columnas visibles)
    const step = cardsPerRow;
    const totalGroups = groupedProjects.length;

    if (direction === 'next') {
      setCurrentIndex(prev => prev + step);
    } else {
      setCurrentIndex(prev => (prev <= 0 ? totalGroups - step : prev - step));
    }
  };

  // Efecto para salto invisible del infinito
  useEffect(() => {
    if (!isTransitioning) return;
    const timer = setTimeout(() => {
      setIsTransitioning(false);
      const totalGroups = groupedProjects.length;
      if (currentIndex >= totalGroups) {
        setCurrentIndex(currentIndex % totalGroups);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [currentIndex, isTransitioning, groupedProjects.length]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) return;
    
    const newImageFiles = [...formData.imageFiles, ...validFiles];
    setFormData(prev => ({ ...prev, imageFiles: newImageFiles }));
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ 
          ...prev, 
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = async (index) => {
    const publicIdToDelete = formData.imagePublicIds[index];
    
    if (publicIdToDelete) {
      try {
        await deleteImage(publicIdToDelete);
      } catch (error) {
        console.error('Error al eliminar imagen:', error);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
      imagePublicIds: prev.imagePublicIds.filter((_, i) => i !== index)
    }));
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
      images: project.images || (project.image ? [project.image] : []),
      imageFiles: [],
      imagePublicIds: project.imagePublicIds || (project.imagePublicId ? [project.imagePublicId] : []),
      demo: project.demo || '',
      order: project.order !== null && project.order !== undefined ? project.order : null
    });
    addModal.open();
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ 
      title: '', 
      description: '', 
      images: [],
      imageFiles: [],
      imagePublicIds: [],
      demo: '', 
      order: null 
    });
    addModal.open();
  };

  const handleSave = async () => {
    try {
      const existingImages = formData.images.filter((img, idx) => 
        formData.imagePublicIds[idx] && !img.startsWith('data:')
      );
      const existingPublicIds = formData.imagePublicIds.filter(id => id);
      
      let imageUrls = [...existingImages];
      let imagePublicIds = [...existingPublicIds];
      
      if (formData.imageFiles.length > 0) {
        for (const file of formData.imageFiles) {
          const result = await uploadImage(file, 'portfolio/projects');
          imageUrls.push(result.secure_url);
          imagePublicIds.push(result.public_id);
        }
      }

      if (editingId) {
        const oldProject = projectsList.find(p => p.id === editingId);
        const oldIds = oldProject?.imagePublicIds || (oldProject?.imagePublicId ? [oldProject.imagePublicId] : []);
        
        for (const oldId of oldIds) {
          if (!imagePublicIds.includes(oldId)) {
            await deleteImage(oldId);
          }
        }
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
                images: imageUrls,
                imagePublicIds: imagePublicIds,
                image: imageUrls[0],
                imagePublicId: imagePublicIds[0],
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
          images: imageUrls,
          imagePublicIds: imagePublicIds,
          image: imageUrls[0],
          imagePublicId: imagePublicIds[0],
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
      const publicIds = project?.imagePublicIds || (project?.imagePublicId ? [project.imagePublicId] : []);
      
      for (const publicId of publicIds) {
        try {
          await deleteImage(publicId);
        } catch (error) {
          console.error('Error al eliminar imagen:', error);
        }
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

  const openImageViewer = (project, imageIndex = 0) => {
    setSelectedProject(project);
    setCurrentImageIndex(imageIndex);
    imageViewModal.open();
  };

  const navigateImage = (direction) => {
    const images = selectedProject?.images || [selectedProject?.image];
    const total = images.length;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % total);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + total) % total);
    }
  };

  return (
    <SectionWrapper id="Proyectos">
      <div className="relative w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 z-10">
        
        {/* Header Section */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-20 relative">
          <div className="text-center">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-none mb-3 transition-all duration-700 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {lang === 'ES' ? headerData.title : (headerData.titleEN || headerData.title)}
            </h1>
            <div className={`h-[2px] w-32 sm:w-40 bg-gradient-to-r from-transparent via-[#0078C8] to-transparent mx-auto`} />
          </div>
          
          {isAdmin && (
            <div className="absolute right-0 flex items-center gap-2">
              <button 
                onClick={handleAdd}
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

        {projectsList.length === 0 ? (
          <div className={`text-center py-20 sm:py-32 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <p className="text-base sm:text-lg">No hay proyectos cargados aún</p>
          </div>
        ) : (
          <div className="relative">
            {needsCarousel && (
              <>
                <button 
                  onClick={() => handleNavigation('prev')} 
                  disabled={isTransitioning}
                  className={`absolute top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 flex disabled:opacity-30 disabled:cursor-not-allowed ${
                    isDark ? 'bg-[#0078C8] text-white shadow-lg shadow-[#0078C8]/30' : 'bg-[#0078C8] text-white shadow-lg'
                  } ${isMobile ? 'left-0' : 'left-0 sm:-translate-x-4 md:-translate-x-12'}`}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleNavigation('next')} 
                  disabled={isTransitioning}
                  className={`absolute top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 flex disabled:opacity-30 disabled:cursor-not-allowed ${
                    isDark ? 'bg-[#0078C8] text-white shadow-lg shadow-[#0078C8]/30' : 'bg-[#0078C8] text-white shadow-lg'
                  } ${isMobile ? 'right-0' : 'right-0 sm:translate-x-4 md:translate-x-12'}`}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            <div className="overflow-hidden">
              <div 
                className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-out' : ''}`}
                style={{
                  transform: `translateX(-${currentIndex * (100 / cardsPerRow)}%)`
                }}
              >
                {displayGroups.map((column, colIdx) => (
                  <div 
                    key={colIdx}
                    className="flex-shrink-0 flex flex-col gap-6"
                    style={{
                      width: `${100 / cardsPerRow}%`,
                      paddingLeft: '0.5rem',
                      paddingRight: '0.5rem'
                    }}
                  >
                    {column.map((project) => (
                      <div key={project.id} className="w-full flex justify-center">
                        <div className="w-full max-w-sm lg:max-w-none">
                          <ProjectCard 
                            project={project}
                            isDark={isDark}
                            lang={lang}
                            isAdmin={isAdmin}
                            onEdit={() => handleEdit(project)}
                            onDelete={() => handleDelete(project.id)}
                            onImageClick={(imageIndex) => openImageViewer(project, imageIndex)}
                            isMobile={isMobile}
                          />
                        </div>
                      </div>
                    ))}
                    {/* Placeholder para evitar estiramiento si la columna no está llena */}
                    {column.length < rows && Array.from({ length: rows - column.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="w-full flex-1 invisible" />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {needsCarousel && (
              <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8">
                {groupedProjects.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => {
                      if (currentIndex !== idx && !isTransitioning) {
                        setIsTransitioning(true);
                        setCurrentIndex(idx);
                      }
                    }} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      (currentIndex % groupedProjects.length) === idx
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

      {/* Modal Editar Header */}
      <Modal isOpen={editHeaderModal.isOpen} onClose={editHeaderModal.close} title="Editar Configuración">
        <div className="space-y-6">
          <Input
            label="Título (Español)"
            value={headerData.title}
            onChange={(e) => setHeaderData({...headerData, title: e.target.value})}
            helper="Se traducirá automáticamente al inglés"
          />
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#0078C8]">
              Cantidad de Filas
            </label>
            <select 
              value={headerData.rows || 1} 
              onChange={(e) => setHeaderData({...headerData, rows: parseInt(e.target.value)})}
              className={`w-full p-3 rounded-xl border-2 outline-none transition-all text-sm ${
                isDark 
                  ? 'bg-[#0F172A] border-white/10 text-white focus:border-[#0078C8]' 
                  : 'bg-white border-slate-200 text-slate-900 focus:border-[#0078C8]'
              }`}
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num} Fila{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleSaveHeader} className="w-full">Guardar</Button>
        </div>
      </Modal>

      {/* Modal Agregar/Editar Proyecto */}
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
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#0078C8]">
              Imágenes del Proyecto
            </label>
            <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              isDark ? 'border-white/10 hover:border-[#0078C8]/40 bg-white/5' : 'border-slate-200 hover:border-[#0078C8]/40 bg-slate-50'
            }`}>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" id="project-images" />
              <label htmlFor="project-images" className="cursor-pointer">
                <div className="py-4">
                  <svg className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-white/40' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs">Click para seleccionar imágenes</p>
                </div>
              </label>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt="" className="w-full h-20 object-cover rounded-lg border border-[#0078C8]/30" />
                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[#0078C8] block mb-2">
              Posición en el Carrusel
            </label>
            <select
              value={formData.order || ''}
              onChange={(e) => setFormData({...formData, order: e.target.value ? parseInt(e.target.value) : null})}
              className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all text-sm ${
                isDark
                  ? 'bg-slate-800/50 border-slate-700 text-white focus:border-[#0078C8]'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-[#0078C8]'
              }`}
            >
              <option value="">Seleccionar posición...</option>
              {getAvailableOrders().map(order => (
                <option key={order} value={order}>
                  Posición {order} {formData.order === order ? '(actual)' : ''}
                </option>
              ))}
            </select>
          </div>
          
          <Input label="URL del Demo" value={formData.demo} onChange={(e) => setFormData({...formData, demo: e.target.value})} placeholder="https://..." />
          <Button onClick={handleSave} disabled={uploading} className="w-full mt-6">
            {uploading ? 'GUARDANDO...' : 'GUARDAR PROYECTO'}
          </Button>
        </div>
      </Modal>

      {/* Modal Visor de Imágenes */}
      <Modal 
        isOpen={imageViewModal.isOpen} 
        onClose={imageViewModal.close} 
        centered
        maxWidth="max-w-[90vw]"
        hideHeader
      >
        {selectedProject && (
          <div className="relative w-full h-[80vh] flex flex-col items-center">
            <button 
              onClick={imageViewModal.close}
              className="absolute top-0 -right-2 md:right-2 p-2 rounded-full transition-all duration-300 z-[70] shadow-xl backdrop-blur-md bg-red-500 text-white"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-3 sm:mb-4 text-center px-4">
              <h3 className={`text-lg sm:text-xl md:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {lang === 'ES' ? selectedProject.title : (selectedProject.titleEN || selectedProject.title)}
              </h3>
            </div>

            <div className="relative flex-1 w-full bg-black/5 rounded-3xl overflow-hidden flex items-center justify-center">
              <img 
                src={(selectedProject.images && selectedProject.images.length > 0) ? selectedProject.images[currentImageIndex] : selectedProject.image} 
                alt="Project Gallery"
                className="max-w-full max-h-full object-contain select-none"
              />
              
              {(selectedProject.images?.length > 1) && (
                <>
                  <button
                    onClick={() => navigateImage('prev')}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-[#0078C8] text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all z-50 backdrop-blur-md"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigateImage('next')}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-[#0078C8] text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all z-50 backdrop-blur-md"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </SectionWrapper>
  );
}

function ProjectCard({ project, isDark, lang, isAdmin, onEdit, onDelete, onImageClick, isMobile = false }) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const images = project.images && project.images.length > 0 ? project.images : [project.image];
  const hasMultipleImages = images.length > 1;
  
  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="group relative h-full max-h-[540px] flex flex-col">
      <div className={`absolute inset-0 blur-[80px] opacity-0 group-hover:opacity-20 transition-all duration-1000 ${
        isDark ? 'bg-[#0078C8]' : 'bg-[#0078C8]/50'
      }`} />
      
      <div className={`relative h-full flex flex-col rounded-3xl border overflow-hidden transition-all duration-700 ${
        isDark 
          ? 'bg-[#0F172A]/40 backdrop-blur-sm border-white/5 group-hover:border-[#0078C8]/40 shadow-2xl shadow-black/50' 
          : 'bg-white border-slate-200 shadow-xl group-hover:border-[#0078C8]/40'
      }`}>
        
        <div className="relative overflow-hidden aspect-[16/9] flex-shrink-0 cursor-pointer" onClick={() => onImageClick(currentImgIndex)}>
          {images[currentImgIndex] && (
            <img 
              src={images[currentImgIndex]} 
              alt={project.title} 
              className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
            />
          )}
          
          <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-700 ${
            isDark ? 'from-[#0F172A] via-[#0F172A]/60 to-transparent opacity-60' : 'from-white via-white/60 to-transparent opacity-40'
          }`} />

          {hasMultipleImages && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-7 h-7 rounded-full flex items-center justify-center z-20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-7 h-7 rounded-full flex items-center justify-center z-20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-1 min-h-[300px]">
          <h4 className={`text-base sm:text-lg md:text-xl font-black tracking-tight mb-1.5 sm:mb-2 leading-tight text-center transition-colors duration-300 line-clamp-2 flex-shrink-0 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {lang === 'ES' ? project.title : (project.titleEN || project.title)}
          </h4>
          
          <div className="flex-1 min-h-0 mb-3 sm:mb-4 overflow-hidden">
            <p className={`text-xs sm:text-sm leading-relaxed line-clamp-8 text-center transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {lang === 'ES' ? project.description : (project.descriptionEN || project.description)}
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2">
            <a href={project.demo} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 sm:py-2.5 px-3 rounded-xl font-black uppercase tracking-[0.15em] text-[8px] sm:text-[9px] transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 bg-[#0078C8] text-white hover:bg-[#005A96] shadow-lg shadow-[#0078C8]/20">
              <span className="hidden sm:inline">{lang === 'ES' ? 'Ver Web' : 'View Site'}</span>
              <span className="sm:hidden">{lang === 'ES' ? 'Ver' : 'View'}</span>
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </a>
            
            {isAdmin && (
              <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                <button onClick={onEdit} className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" /></svg>
                </button>
                <button onClick={onDelete} className="p-2 sm:p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}