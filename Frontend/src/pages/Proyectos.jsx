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

// Función para detectar si una URL es un video
const isVideo = (url) => {
  if (!url) return false;
  return url.startsWith('data:video/') || /\.(mp4|webm|mov|avi)$/i.test(url) || url.includes('/video/upload/');
};

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
  const [techCarouselIndex, setTechCarouselIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? document.documentElement.clientWidth : 1024);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, message: '' });
  
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    images: [],
    imageFiles: [],
    imagePublicIds: [],
    demo: '',
    row: 1,
    order: null,
    technologies: [],
    technologyNames: []
  });
  
  const [headerData, setHeaderData] = useState({ 
    title: 'Proyectos',
    titleEN: 'Projects',
    description: '',
    descriptionEN: '',
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
      setWindowWidth(document.documentElement.clientWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  

  const projectsList = Array.isArray(projects?.list || projects) ? (projects?.list || projects) : [];
  
// Breakpoints ajustados - Pasan más rápido para evitar apretujamiento
const isMobile = windowWidth < 640;
const isSmall = windowWidth >= 640 && windowWidth < 1100;   // Pasa a 2
const isTablet = windowWidth >= 1100 && windowWidth < 1450; // Pasa a 3 en 1450px
const isMedium = windowWidth >= 1450 && windowWidth < 1700; // Pasa a 4
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

  // Calcular el máximo número de proyectos entre todas las filas
  const getMaxProjectsInAnyRow = () => {
    const rowsData = getProjectsByRow();
    let maxProjects = 0;
    Object.values(rowsData).forEach(rowProjects => {
      if (rowProjects.length > maxProjects) {
        maxProjects = rowProjects.length;
      }
    });
    return maxProjects;
  };

  const maxProjectsInAnyRow = getMaxProjectsInAnyRow();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    // Aceptar imágenes y videos
    const validFiles = files.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
    
    if (validFiles.length === 0) return;
    
    const newImageFiles = [...formData.imageFiles, ...validFiles];
    const newPublicIds = [...formData.imagePublicIds, ...validFiles.map(() => null)];
    
    setFormData(prev => ({ 
      ...prev, 
      imageFiles: newImageFiles,
      imagePublicIds: newPublicIds
    }));
    
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

  const moveImage = (index, direction) => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.images.length) return;
    
    const newImages = [...formData.images];
    const newImageFiles = [...formData.imageFiles];
    const newPublicIds = [...formData.imagePublicIds];
    
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    [newImageFiles[index], newImageFiles[newIndex]] = [newImageFiles[newIndex], newImageFiles[index]];
    [newPublicIds[index], newPublicIds[newIndex]] = [newPublicIds[newIndex], newPublicIds[index]];
    
    setFormData(prev => ({
      ...prev,
      images: newImages,
      imageFiles: newImageFiles,
      imagePublicIds: newPublicIds
    }));
  };

  // Funciones para manejar tecnologías
  const handleTechnologyChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) return;
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          technologies: [...prev.technologies, reader.result],
          technologyNames: [...prev.technologyNames, file.name.replace(/\.[^/.]+$/, '')]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleTechnologyUrlAdd = (url, name) => {
    if (!url.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      technologies: [...prev.technologies, url],
      technologyNames: [...prev.technologyNames, name || '']
    }));
  };

  const removeTechnology = (index) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index),
      technologyNames: prev.technologyNames.filter((_, i) => i !== index)
    }));
  };

  const updateTechnologyName = (index, newName) => {
    setFormData(prev => ({
      ...prev,
      technologyNames: prev.technologyNames.map((name, i) => i === index ? newName : name)
    }));
  };

  const moveTechnology = (index, direction) => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.technologies.length) return;
    
    const newTechnologies = [...formData.technologies];
    const newTechnologyNames = [...formData.technologyNames];
    
    [newTechnologies[index], newTechnologies[newIndex]] = [newTechnologies[newIndex], newTechnologies[index]];
    [newTechnologyNames[index], newTechnologyNames[newIndex]] = [newTechnologyNames[newIndex], newTechnologyNames[index]];
    
    setFormData(prev => ({
      ...prev,
      technologies: newTechnologies,
      technologyNames: newTechnologyNames
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
    const existingImages = project.images || (project.image ? [project.image] : []);
    setFormData({ 
      title: project.title || '', 
      description: project.description || '', 
      images: existingImages,
      imageFiles: existingImages.map(() => null), // null para cada imagen existente
      imagePublicIds: project.imagePublicIds || (project.imagePublicId ? [project.imagePublicId] : []),
      demo: project.demo || '',
      row: project.row || 1,
      order: project.order !== null && project.order !== undefined ? project.order : null,
      technologies: project.technologies || [],
      technologyNames: project.technologyNames || []
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
      order: getRandomUnusedOrderForRow(defaultRow),
      technologies: [],
      technologyNames: []
    });
    addModal.open();
  };

  const handleSave = async () => {
    try {
      console.log('📦 FormData antes de guardar:', formData);
      
      // Contar cuántos archivos nuevos hay que subir
      const newFilesCount = formData.images.filter(img => img.startsWith('data:')).length;
      let uploadedCount = 0;
      
      setUploadProgress({ current: 0, total: newFilesCount, message: 'Preparando...' });
      
      // Separar imágenes existentes (ya subidas) de nuevas (data URLs)
      let imageUrls = [];
      let imagePublicIds = [];
      
      // Primero, agregar las imágenes que ya estaban subidas
      for (let i = 0; i < formData.images.length; i++) {
        const img = formData.images[i];
        const publicId = formData.imagePublicIds[i];
        
        // Si la imagen NO empieza con 'data:', ya está subida
        if (!img.startsWith('data:')) {
          imageUrls.push(img);
          imagePublicIds.push(publicId);
          console.log(`✅ Imagen existente ${i}:`, img.substring(0, 50), publicId);
        }
      }
      
      // Ahora subir los archivos nuevos (los que tienen data: URLs)
      for (let i = 0; i < formData.images.length; i++) {
        const img = formData.images[i];
        const file = formData.imageFiles[i];
        
        // Si empieza con 'data:', es un archivo nuevo que hay que subir
        if (img.startsWith('data:') && file) {
          uploadedCount++;
          const fileType = file.type.startsWith('video/') ? 'video' : 'imagen';
          const fileSize = (file.size / (1024 * 1024)).toFixed(2); // MB
          
          setUploadProgress({ 
            current: uploadedCount, 
            total: newFilesCount, 
            message: `Subiendo ${fileType} ${uploadedCount}/${newFilesCount} (${fileSize}MB) - 0%`,
            percent: 0
          });
          
          console.log(`📤 Subiendo archivo nuevo ${i}:`, file.name, file.type);
          
          // Usar callback de progreso
          const result = await uploadImage(file, 'portfolio/projects', (percent) => {
            setUploadProgress({ 
              current: uploadedCount, 
              total: newFilesCount, 
              message: `Subiendo ${fileType} ${uploadedCount}/${newFilesCount} (${fileSize}MB) - ${percent}%`,
              percent: percent
            });
          });
          
          console.log(`✅ Resultado de subida ${i}:`, result);
          imageUrls.push(result.secure_url);
          imagePublicIds.push(result.public_id);
        }
      }

      setUploadProgress({ current: newFilesCount, total: newFilesCount, message: 'Guardando proyecto...' });

      console.log('📋 URLs finales:', imageUrls);
      console.log('📋 PublicIds finales:', imagePublicIds);

      // Eliminar imágenes viejas que ya no están
      if (editingId) {
        const oldProject = projectsList.find(p => p.id === editingId);
        const oldIds = oldProject?.imagePublicIds || (oldProject?.imagePublicId ? [oldProject.imagePublicId] : []);
        
        for (const oldId of oldIds) {
          if (oldId && !imagePublicIds.includes(oldId)) {
            await deleteImage(oldId);
          }
        }
      }

      const [tEN, dEN] = await translateMultiple([formData.title, formData.description]);
      const finalOrder = formData.order !== null && formData.order !== undefined 
        ? parseInt(formData.order)
        : getRandomUnusedOrderForRow(formData.row);

      const projectData = {
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
        order: finalOrder,
        technologies: formData.technologies,
        technologyNames: formData.technologyNames
      };

      console.log('💾 Datos del proyecto a guardar:', projectData);

      let updatedProjects;
      if (editingId) {
        updatedProjects = projectsList.map(p => 
          p.id === editingId 
            ? { ...p, ...projectData }
            : p
        );
      } else {
        updatedProjects = [...projectsList, { 
          ...projectData,
          id: Date.now().toString()
        }];
      }

      await onUpdate({ list: updatedProjects, header: headerData });
      setUploadProgress({ current: 0, total: 0, message: '' });
      addModal.close();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el proyecto');
      setUploadProgress({ current: 0, total: 0, message: '' });
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
    const textsToTranslate = [headerData.title];
    
    // Solo traducir la descripción si existe contenido
    if (headerData.description && headerData.description.trim()) {
      textsToTranslate.push(headerData.description);
    }
    
    const translations = await translateMultiple(textsToTranslate);
    
    const updatedHeader = { 
      ...headerData, 
      titleEN: translations[0],
      descriptionEN: translations.length > 1 ? translations[1] : ''
    };
    
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
    setTechCarouselIndex(0);
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
        <div className={`flex items-center justify-center gap-4 sm:gap-6 relative ${
          (headerData.description || headerData.descriptionEN) ? 'mb-8 sm:mb-8' : 'mb-8 sm:mb-20'
        }`}>
          <div className="text-center">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none mb-3 transition-all duration-700 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {lang === 'ES' ? headerData.title : (headerData.titleEN || headerData.title)}
            </h1>
            <div className={`h-[2px] w-32 sm:w-40 bg-gradient-to-r from-transparent via-[#0078C8] to-transparent mx-auto`} />
            
            {/* Descripción opcional */}
            {(headerData.description || headerData.descriptionEN) && (
              <p className={`mt-4 sm:mt-6 text-sm sm:text-base md:text-lg max-w-5xl mx-auto transition-all duration-700 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {lang === 'ES' ? headerData.description : (headerData.descriptionEN || headerData.description)}
              </p>
            )}
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
                  maxProjectsInAnyRow={maxProjectsInAnyRow}
                  isDark={isDark}
                  lang={lang}
                  isAdmin={isAdmin}
                  isMobile={isMobile}
                  windowWidth={windowWidth}
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
          <Textarea
            label="Descripción (Español) - Opcional"
            value={headerData.description || ''}
            onChange={(e) => setHeaderData({...headerData, description: e.target.value})}
            rows={3}
            helper="Descripción que aparecerá debajo del título. Se traducirá automáticamente al inglés. Dejar vacío para no mostrar."
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
              Imágenes y Videos del Proyecto
            </label>
            <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              isDark ? 'border-white/10 hover:border-[#0078C8]/40 bg-white/5' : 'border-slate-200 hover:border-[#0078C8]/40 bg-slate-50'
            }`}>
              <input type="file" accept="image/*,video/*" multiple onChange={handleImageChange} className="hidden" id="project-images" />
              <label htmlFor="project-images" className="cursor-pointer">
                <div className="py-4">
                  <svg className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-white/40' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs">Click para seleccionar imágenes o videos</p>
                  <p className={`text-[10px] mt-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>MP4, WebM, MOV, JPG, PNG, etc.</p>
                </div>
              </label>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {formData.images.map((media, idx) => (
                  <div key={idx} className="relative group">
                    {isVideo(media) ? (
                      <video src={media} className="w-full h-20 object-cover rounded-lg border border-[#0078C8]/30" muted />
                    ) : (
                      <img src={media} alt="" className="w-full h-20 object-cover rounded-lg border border-[#0078C8]/30" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 'left')}
                        disabled={idx === 0}
                        className="p-1 bg-blue-500 text-white rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 'right')}
                        disabled={idx === formData.images.length - 1}
                        className="p-1 bg-blue-500 text-white rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-1 bg-red-500 text-white rounded"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {isVideo(media) && (
                      <div className="absolute bottom-1 left-1 bg-purple-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">VIDEO</div>
                    )}
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
          
          {/* Tecnologías Utilizadas */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#0078C8]">
              Tecnologías Utilizadas (Opcional)
            </label>
            
            {/* Opción 1: Subir archivos */}
            <div className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
              isDark ? 'border-white/10 hover:border-[#0078C8]/40 bg-white/5' : 'border-slate-200 hover:border-[#0078C8]/40 bg-slate-50'
            }`}>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleTechnologyChange} 
                className="hidden" 
                id="tech-images" 
              />
              <label htmlFor="tech-images" className="cursor-pointer">
                <div className="py-2">
                  <svg className={`w-6 h-6 mx-auto mb-1.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-xs font-medium">Subir imágenes</p>
                  <p className={`text-[9px] mt-0.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>PNG, JPG, SVG</p>
                </div>
              </label>
            </div>
            
            {/* Opción 2: Agregar por URL */}
            <div className={`border-2 rounded-xl p-3 transition-all ${
              isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="URL de imagen de tecnología"
                  id="tech-url-input"
                  className={`flex-1 px-3 py-2 rounded-lg border text-xs transition-all ${
                    isDark 
                      ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-[#0078C8]' 
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#0078C8]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const urlInput = document.getElementById('tech-url-input');
                    if (urlInput.value.trim()) {
                      handleTechnologyUrlAdd(urlInput.value, '');
                      urlInput.value = '';
                    }
                  }}
                  className={`px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                    'bg-[#0078C8] text-white hover:bg-[#005A96]'
                  }`}
                >
                  + URL
                </button>
              </div>
            </div>

            {/* Grid de tecnologías agregadas */}
            {formData.technologies.length > 0 && (
              <div className="space-y-2">
                <div className={`text-[10px] font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                  {formData.technologies.length} tecnología{formData.technologies.length !== 1 ? 's' : ''} agregada{formData.technologies.length !== 1 ? 's' : ''}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {formData.technologies.map((tech, idx) => (
                    <div key={idx} className="relative">
                      <div className={`relative rounded-lg p-2 border transition-all group ${
                        isDark ? 'border-white/10 bg-white/5 hover:border-white/20' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}>
                        <img 
                          src={tech} 
                          alt="" 
                          className="w-full h-14 object-contain"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveTechnology(idx, 'left')}
                            disabled={idx === 0}
                            className="p-0.5 bg-blue-500 text-white rounded text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveTechnology(idx, 'right')}
                            disabled={idx === formData.technologies.length - 1}
                            className="p-0.5 bg-blue-500 text-white rounded text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeTechnology(idx)}
                            className="p-0.5 bg-red-500 text-white rounded text-xs"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <input 
                        type="text"
                        value={formData.technologyNames[idx] || ''}
                        onChange={(e) => updateTechnologyName(idx, e.target.value)}
                        placeholder="Nombre (opcional)"
                        className={`mt-1.5 w-full px-2 py-1 text-[10px] text-center rounded border transition-all ${
                          isDark 
                            ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-[#0078C8]' 
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#0078C8]'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Barra de progreso */}
          {uploadProgress.total > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {uploadProgress.message}
                </span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden ${
                isDark ? 'bg-slate-700' : 'bg-slate-200'
              }`}>
                <div 
                  className="h-full bg-gradient-to-r from-[#0078C8] to-[#00A8E8] transition-all duration-300 ease-out relative overflow-hidden"
                  style={{ 
                    width: `${uploadProgress.percent !== undefined ? uploadProgress.percent : (uploadProgress.current / uploadProgress.total) * 100}%` 
                  }}
                >
                  {/* Animación de brillo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                       style={{ animation: 'shimmer 2s infinite' }} />
                </div>
              </div>
              {/* Progreso global */}
              <div className="flex items-center justify-between text-xs">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  Archivo {uploadProgress.current} de {uploadProgress.total}
                </span>
                <span className={`font-bold ${isDark ? 'text-[#0078C8]' : 'text-[#0078C8]'}`}>
                  Total: {Math.round(((uploadProgress.current - 1) / uploadProgress.total + (uploadProgress.percent || 0) / (100 * uploadProgress.total)) * 100)}%
                </span>
              </div>
            </div>
          )}
          
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
              {isVideo((selectedProject.images && selectedProject.images.length > 0) ? selectedProject.images[currentImageIndex] : selectedProject.image) ? (
                <video 
                  src={(selectedProject.images && selectedProject.images.length > 0) ? selectedProject.images[currentImageIndex] : selectedProject.image}
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain select-none"
                />
              ) : (
                <img 
                  src={(selectedProject.images && selectedProject.images.length > 0) ? selectedProject.images[currentImageIndex] : selectedProject.image} 
                  alt="Project Gallery"
                  className="max-w-full max-h-full object-contain select-none"
                />
              )}
              
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

            {/* Tecnologías - Carrusel Infinito */}
            {selectedProject.technologies && selectedProject.technologies.length > 0 && (
              <div className="mt-3 px-4 sm:px-6 pb-3 w-full">
                {selectedProject.technologies.length <= 6 ? (
                  // Si hay 6 o menos, mostrar todas sin carrusel
                  <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center items-center max-w-xl mx-auto">
                    {selectedProject.technologies.map((tech, idx) => (
                      <div 
                        key={idx} 
                        className="transition-all duration-300 hover:scale-110"
                        title={selectedProject.technologyNames?.[idx] || ''}
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 p-1.5">
                          <img 
                            src={tech} 
                            alt={selectedProject.technologyNames?.[idx] || ''} 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Si hay más de 6, mostrar carrusel infinito
                  <div className="relative max-w-xl mx-auto">
                    <button
                      onClick={() => {
                        setTechCarouselIndex(prev => {
                          const newIndex = prev - 1;
                          return newIndex < 0 ? selectedProject.technologies.length - 1 : newIndex;
                        });
                      }}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 p-2 rounded-full bg-[#0078C8] text-white hover:scale-110 transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="flex gap-2.5 sm:gap-3 justify-center items-center overflow-hidden">
                      {Array.from({ length: 6 }).map((_, idx) => {
                        const techIndex = (techCarouselIndex + idx) % selectedProject.technologies.length;
                        const tech = selectedProject.technologies[techIndex];
                        return (
                          <div 
                            key={idx} 
                            className="transition-all duration-300 hover:scale-110"
                            title={selectedProject.technologyNames?.[techIndex] || ''}
                          >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 p-1.5">
                              <img 
                                src={tech} 
                                alt={selectedProject.technologyNames?.[techIndex] || ''} 
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => {
                        setTechCarouselIndex(prev => (prev + 1) % selectedProject.technologies.length);
                      }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 p-2 rounded-full bg-[#0078C8] text-white hover:scale-110 transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
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
  maxProjectsInAnyRow, 
  isDark, 
  lang, 
  isAdmin, 
  isMobile,
  windowWidth,
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

  // Determinar cuándo usar justify-center vs justify-around
  // Usar maxProjectsInAnyRow para consistencia entre filas
  const shouldUseJustifyCenter = () => {
    const effectiveCardCount = Math.min(maxProjectsInAnyRow, cardsPerRow);
    
    if (effectiveCardCount === 2) {
      return windowWidth < 1000;
    } else if (effectiveCardCount === 3) {
      return windowWidth < 1000;
    } else if (effectiveCardCount === 4) {
      return windowWidth < 1100;
    }
    
    return true;
  };

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
              className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-out' : ''} 
                ${!needsCarousel ? (shouldUseJustifyCenter() ? 'justify-center' : 'justify-around') : ''}`}
              style={needsCarousel ? {
                transform: `translateX(-${currentIndex * (100 / cardsPerRow)}%)`
              } : {}}
            >
              {displayGroups.map((column, colIdx) => {
                // Usar maxProjectsInAnyRow para que todas las filas tengan el mismo tamaño
                // Esto asegura consistencia visual entre filas
                const effectiveCardCount = Math.min(maxProjectsInAnyRow, cardsPerRow);
                
                const isTwo = !needsCarousel && effectiveCardCount === 2;
                const isThree = !needsCarousel && effectiveCardCount === 3;
                const isFour = !needsCarousel && effectiveCardCount === 4;
                
                // SISTEMA PARA 2 CARDS
                let twoCardsWidth = '45%';
                if (isTwo) {
                  if (windowWidth >= 1700) twoCardsWidth = '42%';      // Gap grande
                  else if (windowWidth >= 1600) twoCardsWidth = '43%'; 
                  else if (windowWidth >= 1500) twoCardsWidth = '44%';
                  else if (windowWidth >= 1400) twoCardsWidth = '45%';
                  else if (windowWidth >= 1300) twoCardsWidth = '46%';
                  else if (windowWidth >= 1200) twoCardsWidth = '47%';
                  else if (windowWidth >= 1100) twoCardsWidth = '48%';
                  else if (windowWidth >= 1000) twoCardsWidth = '49%';
                  else twoCardsWidth = '50%'; // Gap mínimo
                }
                
                // SISTEMA PARA 3 CARDS
                let threeCardsWidth = '30%';
                if (isThree) {
                  if (windowWidth >= 1700) threeCardsWidth = '28%';
                  else if (windowWidth >= 1600) threeCardsWidth = '29%';
                  else if (windowWidth >= 1500) threeCardsWidth = '30%';
                  else if (windowWidth >= 1400) threeCardsWidth = '31%';
                  else if (windowWidth >= 1300) threeCardsWidth = '31.5%';
                  else if (windowWidth >= 1200) threeCardsWidth = '32%';
                  else if (windowWidth >= 1100) threeCardsWidth = '32.5%';
                  else if (windowWidth >= 1000) threeCardsWidth = '33%';
                  else threeCardsWidth = '33.3%';
                }
                
                // SISTEMA PARA 4 CARDS
                let fourCardsWidth = '23%';
                if (isFour) {
                  if (windowWidth >= 1700) fourCardsWidth = '22.5%';
                  else if (windowWidth >= 1600) fourCardsWidth = '23%';
                  else if (windowWidth >= 1500) fourCardsWidth = '23.3%';
                  else if (windowWidth >= 1400) fourCardsWidth = '23.6%';
                  else if (windowWidth >= 1350) fourCardsWidth = '24%';
                  else if (windowWidth >= 1300) fourCardsWidth = '24.3%';
                  else if (windowWidth >= 1200) fourCardsWidth = '24.5%';
                  else if (windowWidth >= 1100) fourCardsWidth = '24.7%';
                  else fourCardsWidth = '25%';
                }
                
                // Determinar width final
                let finalWidth;
                if (isTwo) {
                  finalWidth = twoCardsWidth;
                } else if (isThree) {
                  finalWidth = threeCardsWidth;
                } else if (isFour) {
                  finalWidth = fourCardsWidth;
                } else {
                  finalWidth = `${100 / cardsPerRow}%`;
                }
                
                return (
                  <div 
                    key={colIdx}
                    className="flex-shrink-0 flex flex-col gap-6"
                    style={{
                      width: finalWidth,
                      paddingLeft: isMobile ? '1rem' : '0.5rem',
                      paddingRight: isMobile ? '1rem' : '0.5rem'
                    }}
                  >
                    {column.map((project) => (
                      <div key={project.id} className="w-full flex justify-center h-full">
                        <div className="w-full max-w-md h-full">
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
                );
              })}
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

  const currentMedia = images[currentImgIndex];
  const isCurrentVideo = isVideo(currentMedia);

  return (
    <div className="group relative h-full min-h-[380px] sm:min-h-[420px] flex flex-col">
      <div className={`relative h-full flex flex-col rounded-3xl border overflow-hidden transition-all duration-700 ${
        isDark 
          ? 'bg-[#0F172A]/40 border-white/5 group-hover:border-[#0078C8]/40 shadow-2xl shadow-black/50' 
          : 'bg-white border-slate-200 shadow-xl group-hover:border-[#0078C8]/40'
      }`}>
        
        {/* Imagen/Video - Ajuste de aspect ratio en mobile para dar espacio */}
        <div className="relative overflow-hidden aspect-video sm:aspect-[16/9] flex-shrink-0 cursor-pointer" onClick={() => onImageClick(currentImgIndex)}>
          {isCurrentVideo ? (
            <video 
              src={currentMedia}
              muted
              loop
              playsInline
              className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
            />
          ) : (
            currentMedia && (
              <img 
                src={currentMedia} 
                alt={project.title} 
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
              />
            )
          )}

          {isCurrentVideo && (
            <div className="absolute top-3 right-3 bg-purple-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              VIDEO
            </div>
          )}

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

        {/* Contenido - Padding reducido para cards más compactas */}
        <div className="p-3 sm:p-4 flex flex-col flex-1 min-h-0">
          {/* Título */}
          <h4 className={`text-lg sm:text-xl font-black tracking-tight mb-2 leading-tight text-center transition-colors duration-300 flex-shrink-0 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: '1.2'
          }}>
            {lang === 'ES' ? project.title : (project.titleEN || project.title)}
          </h4>
          
          {/* Descripción - 5 líneas que caben sin agrandar la card */}
          <div 
            className="mb-3 overflow-hidden flex-shrink-0"
            style={{ 
              // Altura exacta: 120px = 5 líneas × 24px (nunca se corta a la mitad)
              height: '120px'
            }}
          >
            <p className={`text-sm text-center transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 5,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '24px'
            }}>
              {lang === 'ES' ? project.description : (project.descriptionEN || project.description)}
            </p>
          </div>

          {/* Botones - Siempre visibles al final con espacio flexible arriba */}
          <div className="mt-auto flex items-center gap-2 flex-shrink-0">
            <a href={project.demo} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 px-3 rounded-xl font-black uppercase tracking-[0.15em] text-[10px] transition-all duration-300 flex items-center justify-center gap-2 bg-[#0078C8] text-white hover:bg-[#005A96] shadow-lg shadow-[#0078C8]/20">
              <span>{lang === 'ES' ? 'Ver Proyecto' : 'View Project'}</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </a>
            
            {isAdmin && (
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={onEdit} className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" /></svg>
                </button>
                <button onClick={onDelete} className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}