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
  const editRowTitleModal = useModal();
  const imageViewModal = useModal();
  const { uploadImage, deleteImage, uploading } = useCloudinary();
  const { translateMultiple } = useTranslate();
  
  const [editingId, setEditingId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    images: [],
    imageFiles: [],
    imagePublicIds: [],
    demo: '',
    row: 1,
    order: null 
  });
  
  const [headerData, setHeaderData] = useState({ 
    title: 'Proyectos',
    titleEN: 'Projects',
    rows: 1,
    rowTitles: {} // { 1: 'Título Fila 1', 2: 'Título Fila 2', ... }
  });

  const [rowTitleForm, setRowTitleForm] = useState({
    rowIndex: 1,
    title: ''
  });

  useEffect(() => {
    if (projects?.header) {
      setHeaderData(projects.header);
    }
  }, [projects]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  

  const projectsList = Array.isArray(projects?.list || projects) ? (projects?.list || projects) : [];
  
const isMobile = windowWidth < 640;
const isSmall = windowWidth >= 640 && windowWidth < 768;
const isTablet = windowWidth >= 768 && windowWidth < 1280;
const isMedium = windowWidth >= 1280 && windowWidth < 1536;
const cardsPerRow = isMobile ? 1 : isSmall ? 2 : isTablet ? 3 : isMedium ? 4 : 5;

  // Agrupar proyectos por fila
  const getProjectsByRow = () => {
    const rowsData = {};
    const totalRows = headerData.rows || 1;
    
    // Inicializar todas las filas
    for (let i = 1; i <= totalRows; i++) {
      rowsData[i] = [];
    }
    
    // Agrupar proyectos por fila
    projectsList.forEach(project => {
      const projectRow = project.row || 1;
      if (projectRow <= totalRows) {
        rowsData[projectRow].push(project);
      }
    });
    
    // Ordenar proyectos dentro de cada fila por el campo order
    Object.keys(rowsData).forEach(row => {
      rowsData[row].sort((a, b) => {
        const orderA = a.order !== null && a.order !== undefined ? a.order : Infinity;
        const orderB = b.order !== null && b.order !== undefined ? b.order : Infinity;
        return orderA - orderB;
      });
    });
    
    return rowsData;
  };

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

  const getAvailableOrdersForRow = (rowNumber) => {
    const projectsInRow = projectsList.filter(p => 
      (p.row || 1) === rowNumber && (editingId ? p.id !== editingId : true)
    );
    const usedOrders = projectsInRow.map(p => p.order).filter(o => o !== null && o !== undefined);
    const maxOrder = Math.max(...usedOrders, projectsInRow.length);
    const orders = [];
    for (let i = 1; i <= maxOrder + 1; i++) {
      orders.push(i);
    }
    return orders;
  };

  const getRandomUnusedOrderForRow = (rowNumber) => {
    const projectsInRow = projectsList.filter(p => (p.row || 1) === rowNumber);
    const usedOrders = projectsInRow.map(p => p.order).filter(o => o !== null && o !== undefined);
    const availableOrders = getAvailableOrdersForRow(rowNumber).filter(o => !usedOrders.includes(o));
    return availableOrders[Math.floor(Math.random() * availableOrders.length)] || projectsInRow.length + 1;
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
      row: project.row || 1,
      order: project.order !== null && project.order !== undefined ? project.order : null
    });
    addModal.open();
  };

  const handleAdd = () => {
    const defaultRow = 1;
    setEditingId(null);
    setFormData({ 
      title: '', 
      description: '', 
      images: [],
      imageFiles: [],
      imagePublicIds: [],
      demo: '',
      row: defaultRow,
      order: getRandomUnusedOrderForRow(defaultRow)
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
        : getRandomUnusedOrderForRow(formData.row);

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
                row: formData.row,
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
          row: formData.row,
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

  const openEditRowTitle = (rowIndex) => {
    const currentTitle = headerData.rowTitles?.[rowIndex] || '';
    setRowTitleForm({
      rowIndex,
      title: currentTitle
    });
    setEditingRowIndex(rowIndex);
    editRowTitleModal.open();
  };

  const handleSaveRowTitle = async () => {
    const updatedRowTitles = {
      ...headerData.rowTitles,
      [rowTitleForm.rowIndex]: rowTitleForm.title
    };

    const updatedHeader = {
      ...headerData,
      rowTitles: updatedRowTitles
    };

    // Traducir el título de la fila
    if (rowTitleForm.title.trim()) {
      const [titleEN] = await translateMultiple([rowTitleForm.title]);
      updatedHeader.rowTitles[rowTitleForm.rowIndex] = rowTitleForm.title;
      updatedHeader.rowTitles[`${rowTitleForm.rowIndex}_EN`] = titleEN;
    }

    setHeaderData(updatedHeader);
    await onUpdate({ list: projectsList, header: updatedHeader });
    editRowTitleModal.close();
  };

  const handleDeleteRowTitle = async (rowIndex) => {
    if (confirm('¿Eliminar el título de esta fila?')) {
      const updatedRowTitles = { ...headerData.rowTitles };
      delete updatedRowTitles[rowIndex];
      delete updatedRowTitles[`${rowIndex}_EN`];

      const updatedHeader = {
        ...headerData,
        rowTitles: updatedRowTitles
      };

      setHeaderData(updatedHeader);
      await onUpdate({ list: projectsList, header: updatedHeader });
    }
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

  const rowsData = getProjectsByRow();

  return (
    <SectionWrapper id="Proyectos">
      <div className="relative w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 z-10">
        
        {/* Header Section */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-20 relative">
          <div className="text-center">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none mb-3 transition-all duration-700 ${
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
          <div className="space-y-16">
            {Object.keys(rowsData).sort((a, b) => parseInt(a) - parseInt(b)).map(rowIndex => {
              const rowNumber = parseInt(rowIndex);
              const rowProjects = rowsData[rowNumber];
              
              return (
                <RowCarousel
                  key={`${rowNumber}-${cardsPerRow}`}
                  rowNumber={rowNumber}
                  rowTitle={headerData.rowTitles?.[rowNumber]}
                  rowTitleEN={headerData.rowTitles?.[`${rowNumber}_EN`]}
                  projects={rowProjects}
                  cardsPerRow={cardsPerRow}
                  isDark={isDark}
                  lang={lang}
                  isAdmin={isAdmin}
                  isMobile={isMobile}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onImageClick={openImageViewer}
                  onEditRowTitle={openEditRowTitle}
                  onDeleteRowTitle={handleDeleteRowTitle}
                />
              );
            })}
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

      {/* Modal Editar Título de Fila */}
      <Modal isOpen={editRowTitleModal.isOpen} onClose={editRowTitleModal.close} title={`Título de Fila ${rowTitleForm.rowIndex}`}>
        <div className="space-y-4">
          <Input 
            label="Título de la Fila (Español)" 
            value={rowTitleForm.title} 
            onChange={(e) => setRowTitleForm({...rowTitleForm, title: e.target.value})}
            placeholder="Ej: Proyectos Destacados"
            helper="Se traducirá automáticamente al inglés. Dejar vacío para no mostrar título"
          />
          <Button onClick={handleSaveRowTitle} className="w-full">Guardar Título</Button>
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
              Fila
            </label>
            <select
              value={formData.row}
              onChange={(e) => {
                const newRow = parseInt(e.target.value);
                setFormData({
                  ...formData, 
                  row: newRow,
                  order: getRandomUnusedOrderForRow(newRow)
                });
              }}
              className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all text-sm ${
                isDark
                  ? 'bg-slate-800/50 border-slate-700 text-white focus:border-[#0078C8]'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-[#0078C8]'
              }`}
            >
              {Array.from({ length: headerData.rows || 1 }, (_, i) => i + 1).map(row => (
                <option key={row} value={row}>
                  Fila {row}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[#0078C8] block mb-2">
              Posición en la Fila
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
              {getAvailableOrdersForRow(formData.row).map(order => (
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

// Componente de Carrusel por Fila
function RowCarousel({ 
  rowNumber, 
  rowTitle, 
  rowTitleEN, 
  projects, 
  cardsPerRow, 
  isDark, 
  lang, 
  isAdmin, 
  isMobile,
  onEdit, 
  onDelete, 
  onImageClick,
  onEditRowTitle,
  onDeleteRowTitle
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [virtualIndex, setVirtualIndex] = useState(0); // Índice virtual que siempre crece/decrece

  const sortedProjects = [...projects].sort((a, b) => {
    const orderA = a.order !== null && a.order !== undefined ? a.order : Infinity;
    const orderB = b.order !== null && b.order !== undefined ? b.order : Infinity;
    return orderA - orderB;
  });

  const rows = 1;
  const totalVisible = cardsPerRow * rows;
  const needsCarousel = sortedProjects.length > totalVisible;

  // Agrupar por columnas
  const groupedProjects = [];
  for (let i = 0; i < sortedProjects.length; i += rows) {
    groupedProjects.push(sortedProjects.slice(i, i + rows));
  }

  // Precalcular todas las posiciones válidas del carrusel
  const getValidPositions = () => {
    const positions = [];
    const total = groupedProjects.length;
    
    let pos = 0;
    while (pos + cardsPerRow <= total) {
      positions.push(pos);
      pos += cardsPerRow;
    }
    
    // Si quedan cards al final, agregar una posición que muestre las últimas cardsPerRow
    if (pos < total) {
      positions.push(total - cardsPerRow);
    }
    
    return positions;
  };
  
  const validPositions = getValidPositions();
  
  // Triplicar grupos para buffer infinito
  const displayGroups = needsCarousel 
    ? [...groupedProjects, ...groupedProjects, ...groupedProjects] 
    : groupedProjects;

  // Inicializar en el medio del buffer triplicado
  useEffect(() => {
    if (needsCarousel && virtualIndex === 0) {
      setVirtualIndex(groupedProjects.length);
      setCurrentIndex(validPositions[0] + groupedProjects.length);
    }
  }, []);

  // Resetear carrusel cuando cambia el número de cards por fila (resize)
  useEffect(() => {
    if (needsCarousel) {
      setVirtualIndex(groupedProjects.length);
      setCurrentIndex(validPositions[0] + groupedProjects.length);
      setIsTransitioning(false);
    }
  }, [cardsPerRow]);


  const handleNavigation = (direction) => {
    if (isTransitioning || !needsCarousel) return;
    
    setIsTransitioning(true);
    
    // Calcular la posición actual en el ciclo de validPositions
    const currentRealIndex = currentIndex % groupedProjects.length;
    const currentPosIndex = validPositions.findIndex(pos => pos === currentRealIndex);

    if (direction === 'next') {
      // Siguiente posición en el ciclo
      const nextPosIndex = (currentPosIndex + 1) % validPositions.length;
      const nextRealPos = validPositions[nextPosIndex];
      
      let newIndex;
      // Si volvemos al inicio del ciclo, avanzamos al siguiente set triplicado
      if (nextPosIndex === 0) {
        const currentSet = Math.floor(currentIndex / groupedProjects.length);
        newIndex = (currentSet + 1) * groupedProjects.length + nextRealPos;
      } else {
        const currentSet = Math.floor(currentIndex / groupedProjects.length);
        newIndex = currentSet * groupedProjects.length + nextRealPos;
      }
      
      setCurrentIndex(newIndex);
      setVirtualIndex(prev => prev + 1);
      
      setTimeout(() => {
        setIsTransitioning(false);
        
        // Si estamos en el último set triplicado, saltar al del medio sin animación
        if (newIndex >= groupedProjects.length * 2) {
          setTimeout(() => {
            const pos = newIndex % groupedProjects.length;
            setCurrentIndex(groupedProjects.length + pos);
          }, 50);
        }
      }, 500);
      
    } else {
      // Posición anterior en el ciclo
      const prevPosIndex = (currentPosIndex - 1 + validPositions.length) % validPositions.length;
      const prevRealPos = validPositions[prevPosIndex];
      
      let newIndex;
      // Si volvemos al final del ciclo, retrocedemos al set anterior
      if (prevPosIndex === validPositions.length - 1) {
        const currentSet = Math.floor(currentIndex / groupedProjects.length);
        newIndex = (currentSet - 1) * groupedProjects.length + prevRealPos;
      } else {
        const currentSet = Math.floor(currentIndex / groupedProjects.length);
        newIndex = currentSet * groupedProjects.length + prevRealPos;
      }
      
      setCurrentIndex(newIndex);
      setVirtualIndex(prev => prev - 1);
      
      setTimeout(() => {
        setIsTransitioning(false);
        
        // Si estamos en el primer set triplicado, saltar al del medio sin animación
        if (newIndex < groupedProjects.length) {
          setTimeout(() => {
            const pos = newIndex % groupedProjects.length;
            setCurrentIndex(groupedProjects.length + pos);
          }, 50);
        }
      }, 500);
    }
  };

  const displayTitle = lang === 'ES' ? rowTitle : (rowTitleEN || rowTitle);
  const hasTitle = displayTitle && displayTitle.trim() !== '';

  return (
    <div className="mb-8">
      {/* Título de la fila */}
      {hasTitle && (
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className={`text-xl sm:text-2xl md:text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {displayTitle}
          </h2>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => onEditRowTitle(rowNumber)}
                className={`p-2 rounded-lg transition-all opacity-60 hover:opacity-100 ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-white/60' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => onDeleteRowTitle(rowNumber)}
                className={`p-2 rounded-lg transition-all opacity-60 hover:opacity-100 ${
                  isDark ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-500'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {!hasTitle && isAdmin && (
        <div className="mb-6 px-2">
          <button
            onClick={() => onEditRowTitle(rowNumber)}
            className={`text-sm px-4 py-2 rounded-lg border-2 border-dashed transition-all opacity-60 hover:opacity-100 ${
              isDark 
                ? 'border-white/10 text-slate-500 hover:border-[#0078C8] hover:text-[#0078C8]'
                : 'border-slate-300 text-slate-400 hover:border-[#0078C8] hover:text-[#0078C8]'
            }`}
          >
            + Añadir título a esta fila
          </button>
        </div>
      )}

      {/* Carrusel */}
      {projects.length > 0 ? (
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
                          onEdit={() => onEdit(project)}
                          onDelete={() => onDelete(project.id)}
                          onImageClick={(imageIndex) => onImageClick(project, imageIndex)}
                          isMobile={isMobile}
                        />
                      </div>
                    </div>
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
      ) : (
        <div className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          No hay proyectos en esta fila
        </div>
      )}
    </div>
  );
}

// Componente ProjectCard - SIN CAMBIOS
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
    <div className="group relative h-full max-h-[480px] sm:max-h-[540px] flex flex-col">
      <div className={`relative h-full flex flex-col rounded-3xl border overflow-hidden transition-all duration-700 ${
        isDark 
          ? 'bg-[#0F172A]/40 border-white/5 group-hover:border-[#0078C8]/40 shadow-2xl shadow-black/50' 
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

        <div className="p-4 sm:p-4 md:p-5 flex flex-col flex-1 min-h-[260px] sm:min-h-[300px]">
          <h4 className={`text-lg sm:text-lg md:text-xl font-black tracking-tight mb-2 sm:mb-2 leading-tight text-center transition-colors duration-300 line-clamp-2 flex-shrink-0 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {lang === 'ES' ? project.title : (project.titleEN || project.title)}
          </h4>
          
          <div className="flex-1 min-h-0 mb-3 sm:mb-4 overflow-hidden">
            <p className={`text-sm sm:text-sm leading-relaxed line-clamp-6 sm:line-clamp-8 text-center transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {lang === 'ES' ? project.description : (project.descriptionEN || project.description)}
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2">
            <a href={project.demo} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 sm:py-2.5 px-3 rounded-xl font-black uppercase tracking-[0.15em] text-[9px] sm:text-[9px] transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 bg-[#0078C8] text-white hover:bg-[#005A96] shadow-lg shadow-[#0078C8]/20">
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