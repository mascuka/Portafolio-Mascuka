import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useModal } from '../hooks/useModal';
import { useCloudinary } from '../hooks/useCloudinary';
import translate from 'translate';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import SectionWrapper from '../components/SectionWrapper';
import { getSkillCardClass, getSmallInputClass, getPreviewImageClass, getDragOverClass, getTextClass } from '../constants/styles';

export default function Habilidades({ data, onUpdate }) {
  const { isDark, isAdmin, lang } = useApp();
  const { uploadImage, deleteImage, uploading } = useCloudinary();
  
  const addSectionModal = useModal();
  const addSkillModal = useModal();
  const editSectionModal = useModal();
  const editSkillModal = useModal();
  const editHeaderModal = useModal();
  const certificateViewModal = useModal();
  
  const [editingId, setEditingId] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);
  const [certViewIndex, setCertViewIndex] = useState(0);
  const [certZoom, setCertZoom] = useState(1);
  const [draggedSkill, setDraggedSkill] = useState(null);
  const [draggedSection, setDraggedSection] = useState(null);
  const [dragOverPosition, setDragOverPosition] = useState(null);
  const [dropTarget, setDropTarget] = useState({ sectionIndex: null, skillIndex: null });
  const [currentIndices, setCurrentIndices] = useState({});
  const [isTransitioning, setIsTransitioning] = useState({});
  const [visibleCounts, setVisibleCounts] = useState({});
  const [isDraggingSection, setIsDraggingSection] = useState(false);
  const [originalPosition, setOriginalPosition] = useState(null);
  
  const containerRefs = useRef({});
  
  const [skillForm, setSkillForm] = useState({ 
    name: '', icon: '', iconPublicId: '', iconFile: null, iconType: 'url',
    hasCertificate: false, certTitle: '', certImage: '', certPublicId: '', certFile: null,
    certImages: [], certPublicIds: [], certFiles: [], certTitles: []
  });
  
  const [sectionForm, setSectionForm] = useState({ 
    title: '', 
    rows: 1, 
    width: '100%',
    gridRow: 1,
    gridColumn: 1
  });
  
  const [headerData, setHeaderData] = useState({ 
    title: 'Habilidades',
    titleEN: 'Skills',
    description: '',
    descriptionEN: ''
  });

  const sections = data?.sections || [];

  const widthToColumns = {
    '100%': 12,
    '50%': 6,
    '33.333%': 4
  };

  const calculateVisibleCount = (sectionIndex) => {
    const container = containerRefs.current[sectionIndex];
    if (!container) return 6;

    const cardWidth = 100;
    const gap = 20;
    
    const availableWidth = container.offsetWidth;
    const cardsPerRow = Math.floor((availableWidth + gap) / (cardWidth + gap));
    
    return Math.max(1, cardsPerRow);
  };

  useEffect(() => {
    const updateCounts = () => {
      const newCounts = {};
      sections.forEach((_, idx) => {
        newCounts[idx] = calculateVisibleCount(idx);
      });
      setVisibleCounts(newCounts);
    };

    setTimeout(updateCounts, 100);
    window.addEventListener('resize', updateCounts);
    return () => window.removeEventListener('resize', updateCounts);
  }, [sections]);

  useEffect(() => {
    const initialIndices = {};
    sections.forEach((_, idx) => {
      initialIndices[idx] = 0;
    });
    setCurrentIndices(initialIndices);
  }, [sections.length]);

  // Bloquear scroll del body cuando el modal de certificado está abierto
  useEffect(() => {
    if (certificateViewModal.isOpen) {
      document.body.style.overflow = 'hidden';
      setCertZoom(1);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [certificateViewModal.isOpen]);

  // Cargar headerData desde props
  useEffect(() => {
    if (data?.header) {
      setHeaderData(data.header);
    }
  }, [data]);

  const handleNavigation = (sectionIndex, direction) => {
    if (isTransitioning[sectionIndex]) return;
    
    const section = sections[sectionIndex];
    const skills = section.skills;
    if (!skills || skills.length === 0) return;

    const rows = section.rows || 1;
    const visiblePerRow = visibleCounts[sectionIndex] || 6;
    const totalVisible = visiblePerRow * rows;

    if (skills.length <= totalVisible) return;

    setIsTransitioning(prev => ({ ...prev, [sectionIndex]: true }));
    
    setCurrentIndices(prev => {
      const current = prev[sectionIndex] || 0;
      let newIndex;
      
      if (direction === 'next') {
        newIndex = current + visiblePerRow;
        if (newIndex >= skills.length) {
          newIndex = 0;
        }
      } else {
        newIndex = current - visiblePerRow;
        if (newIndex < 0) {
          const remainder = skills.length % visiblePerRow;
          newIndex = remainder === 0 ? skills.length - visiblePerRow : skills.length - remainder;
        }
      }
      
      return { ...prev, [sectionIndex]: newIndex };
    });

    setTimeout(() => {
      setIsTransitioning(prev => ({ ...prev, [sectionIndex]: false }));
    }, 500);
  };

  const handleFileChange = (file, field) => {
    if (!file) return;
    const isValid = file.type.startsWith('image/') || file.type === 'application/pdf';
    if (!isValid) return alert('Archivo no válido');
    
    setSkillForm(prev => ({ ...prev, [`${field}File`]: file }));
    const reader = new FileReader();
    reader.onloadend = () => setSkillForm(prev => ({ ...prev, [field]: reader.result }));
    reader.readAsDataURL(file);
  };

  const openSectionModal = (index = null) => {
    if (index !== null) {
      const section = sections[index];
      setEditingId(index);
      setSectionForm({ 
        title: section.title,
        rows: section.rows || 1,
        width: section.width || '100%',
        gridRow: section.gridRow || 1,
        gridColumn: section.gridColumn || 1
      });
      editSectionModal.open();
    } else {
      const freePosition = findFreePosition();
      setEditingId(null);
      setSectionForm({ 
        title: '', 
        rows: 1, 
        width: '100%',
        gridRow: freePosition.row,
        gridColumn: freePosition.column
      });
      addSectionModal.open();
    }
  };

  const findFreePosition = () => {
    for (let row = 1; row <= 10; row++) {
      for (let col = 1; col <= 12; col++) {
        const occupied = sections.some(section => {
          const sRow = section.gridRow || 1;
          const sCol = section.gridColumn || 1;
          const sRows = section.rows || 1;
          const sCols = widthToColumns[section.width] || 12;
          
          return row >= sRow && row < sRow + sRows &&
                 col >= sCol && col < sCol + sCols;
        });
        
        if (!occupied) {
          return { row, column: col };
        }
      }
    }
    return { row: 1, column: 1 };
  };

  const saveSectionForm = async () => {
    if (!sectionForm.title) return alert("Completa el título");
    
    try {
      const titleEN = await translate(sectionForm.title, { from: "es", to: "en" });
      const updated = [...sections];
      
      if (editingId !== null) {
        updated[editingId] = { 
          ...updated[editingId], 
          title: sectionForm.title,
          titleEN,
          rows: sectionForm.rows,
          width: sectionForm.width,
          gridRow: sectionForm.gridRow || updated[editingId].gridRow,
          gridColumn: sectionForm.gridColumn || updated[editingId].gridColumn
        };
      } else {
        updated.push({ 
          ...sectionForm, 
          titleEN, 
          skills: [] 
        });
      }
      
      await onUpdate({ sections: updated, header: data?.header || headerData });
      setSectionForm({ title: '', rows: 1, width: '100%', gridRow: 1, gridColumn: 1 });
      setEditingId(null);
      addSectionModal.close();
      editSectionModal.close();
    } catch (error) {
      const updated = [...sections];
      if (editingId !== null) {
        updated[editingId] = { 
          ...updated[editingId], 
          title: sectionForm.title,
          rows: sectionForm.rows,
          width: sectionForm.width,
          gridRow: sectionForm.gridRow || updated[editingId].gridRow,
          gridColumn: sectionForm.gridColumn || updated[editingId].gridColumn
        };
      } else {
        updated.push({ ...sectionForm, skills: [] });
      }
      await onUpdate({ sections: updated, header: data?.header || headerData });
      setSectionForm({ title: '', rows: 1, width: '100%', gridRow: 1, gridColumn: 1 });
      setEditingId(null);
      addSectionModal.close();
      editSectionModal.close();
    }
  };

  const handleDeleteSection = async (index) => {
    if (window.confirm("¿Eliminar esta sección y todas sus habilidades?")) {
      const sectionToDelete = sections[index];
      for (const skill of sectionToDelete.skills) {
        if (skill?.iconPublicId) await deleteImage(skill.iconPublicId);
        if (skill?.certPublicIds?.length) {
          for (const pubId of skill.certPublicIds) {
            if (pubId) await deleteImage(pubId);
          }
        } else if (skill?.certPublicId) {
          await deleteImage(skill.certPublicId);
        }
      }
      const updated = sections.filter((_, i) => i !== index);
      await onUpdate({ sections: updated, header: data?.header || headerData });
    }
  };

  const onDragStartSection = (e, index) => {
    if (!isAdmin) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    const section = sections[index];
    setOriginalPosition({ gridRow: section.gridRow, gridColumn: section.gridColumn });
    setDraggedSection(index);
    setIsDraggingSection(true);
    setDragOverPosition(null);
  };

  const onDragOverGrid = (e) => {
    e.preventDefault();
    if (draggedSection === null || !isAdmin) return;

    const gridContainer = e.currentTarget;
    const rect = gridContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const columnWidth = rect.width / 12;
    const rowHeight = 200;

    let column = Math.max(1, Math.floor(x / columnWidth) + 1);
    const row = Math.max(1, Math.floor(y / rowHeight) + 1);

    const draggedSectionData = sections[draggedSection];
    const cols = widthToColumns[draggedSectionData.width] || 12;

    // Ajustar columna si se sale del grid
    if (column + cols - 1 > 12) {
      column = 13 - cols;
    }

    // SIEMPRE mostrar la posición
    setDragOverPosition({ row, column });
  };

  // Retorna las celdas que ocupa una sección dada un row/col
  const getOccupiedCells = (section, overrideRow, overrideCol) => {
    const r = overrideRow ?? section.gridRow ?? 1;
    const c = overrideCol ?? section.gridColumn ?? 1;
    const rows = section.rows || 1;
    const cols = widthToColumns[section.width] || 12;
    const cells = new Set();
    for (let row = r; row < r + rows; row++) {
      for (let col = c; col < c + cols; col++) {
        cells.add(`${row},${col}`);
      }
    }
    return cells;
  };

  // Encuentran las secciones que colisionan con una posición dada
  const findCollisions = (targetRow, targetCol, draggedIdx) => {
    const dragged = sections[draggedIdx];
    const targetCells = getOccupiedCells(dragged, targetRow, targetCol);
    const collisions = [];
    sections.forEach((section, idx) => {
      if (idx === draggedIdx) return;
      const cells = getOccupiedCells(section);
      for (const cell of cells) {
        if (targetCells.has(cell)) {
          collisions.push(idx);
          return;
        }
      }
    });
    return collisions;
  };

  // Busca la primera posición libre para empujar una sección
  const findPushTarget = (section, startRow, allOccupied) => {
    const cols = widthToColumns[section.width] || 12;
    const rows = section.rows || 1;
    for (let r = startRow; r <= 20; r++) {
      for (let c = 1; c <= 13 - cols; c++) {
        let free = true;
        for (let dr = 0; dr < rows && free; dr++) {
          for (let dc = 0; dc < cols && free; dc++) {
            if (allOccupied.has(`${r + dr},${c + dc}`)) free = false;
          }
        }
        if (free) return { row: r, col: c };
      }
    }
    return null;
  };

  const onDropGrid = () => {
    if (!isAdmin || draggedSection === null || !dragOverPosition) {
      setDraggedSection(null);
      setDragOverPosition(null);
      setIsDraggingSection(false);
      setOriginalPosition(null);
      return;
    }

    const updated = sections.map(s => ({ ...s }));
    const targetRow = dragOverPosition.row;
    const targetCol = dragOverPosition.column;

    // Encontrar colisiones con la nueva posición
    const collisions = findCollisions(targetRow, targetCol, draggedSection);

    // Mover la sección arrastrada
    updated[draggedSection] = {
      ...updated[draggedSection],
      gridRow: targetRow,
      gridColumn: targetCol
    };

    // Empujar las secciones que colisionan hacia abajo
    if (collisions.length > 0) {
      const pushStartRow = targetRow + (updated[draggedSection].rows || 1);

      collisions.forEach(collisionIdx => {
        // Celdas ocupadas por todas excepto la que estamos empujando
        const occupiedExcludingThis = new Set();
        updated.forEach((section, idx) => {
          if (idx === collisionIdx) return;
          const cells = getOccupiedCells(section);
          cells.forEach(c => occupiedExcludingThis.add(c));
        });

        const newPos = findPushTarget(updated[collisionIdx], pushStartRow, occupiedExcludingThis);
        if (newPos) {
          updated[collisionIdx] = {
            ...updated[collisionIdx],
            gridRow: newPos.row,
            gridColumn: newPos.col
          };
        }
      });
    }

    onUpdate({ sections: updated, header: data?.header || headerData });
    setDraggedSection(null);
    setDragOverPosition(null);
    setIsDraggingSection(false);
    setOriginalPosition(null);
  };

  const onDragEnd = () => {
    setDraggedSection(null);
    setDragOverPosition(null);
    setIsDraggingSection(false);
    setOriginalPosition(null);
  };

  const onDragStartSkill = (e, sectionIndex, skillIndex) => {
    if (!isAdmin || isDraggingSection) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    setDraggedSkill({ sectionIndex, skillIndex });
    setDropTarget({ sectionIndex, skillIndex });
  };

  const onDragOverSkill = (e, sectionIndex, skillIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAdmin || !draggedSkill || draggedSkill.sectionIndex !== sectionIndex || isDraggingSection) return;
    setDropTarget({ sectionIndex, skillIndex });
  };

  const onDropSkill = (e, targetSectionIndex, targetSkillIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAdmin || !draggedSkill || draggedSkill.sectionIndex !== targetSectionIndex || isDraggingSection) {
      setDraggedSkill(null);
      setDropTarget({ sectionIndex: null, skillIndex: null });
      return; 
    }

    if (draggedSkill.skillIndex === targetSkillIndex) {
      setDraggedSkill(null);
      setDropTarget({ sectionIndex: null, skillIndex: null });
      return;
    }

    const updatedSections = [...sections];
    const skills = [...updatedSections[targetSectionIndex].skills];
    const [reorderedItem] = skills.splice(draggedSkill.skillIndex, 1);
    skills.splice(targetSkillIndex, 0, reorderedItem);
    updatedSections[targetSectionIndex].skills = skills;
    
    onUpdate({ sections: updatedSections, header: data?.header || headerData });
    setDraggedSkill(null);
    setDropTarget({ sectionIndex: null, skillIndex: null });
  };

  const openSkillModal = (sectionIndex, skillIndex = null) => {
    setCurrentSection(sectionIndex);
    
    if (skillIndex !== null) {
      const skill = sections[sectionIndex].skills[skillIndex];
      const imgs = skill.certImages || (skill.certImage ? [skill.certImage] : []);
      setSkillForm({ 
        ...skill, 
        iconFile: null, 
        certFile: null,
        certFiles: [],
        iconType: skill.iconPublicId ? 'upload' : 'url',
        certImages: imgs,
        certPublicIds: skill.certPublicIds || (skill.certPublicId ? [skill.certPublicId] : []),
        certTitles: skill.certTitles || imgs.map(() => skill.certTitle || '')
      });
      setEditingId(skillIndex);
      editSkillModal.open();
    } else {
      setSkillForm({ 
        name: '', icon: '', iconPublicId: '', iconFile: null, iconType: 'url',
        hasCertificate: false, certTitle: '', certImage: '', certPublicId: '', certFile: null,
        certImages: [], certPublicIds: [], certFiles: [], certTitles: []
      });
      setEditingId(null);
      addSkillModal.open();
    }
  };

  const saveSkillForm = async () => {
    if (!skillForm.name || (!skillForm.icon && !skillForm.iconFile)) 
      return alert("Completa campos básicos");
    if (skillForm.hasCertificate && skillForm.certImages.length === 0 && skillForm.certFiles.length === 0) 
      return alert("Carga al menos un certificado");

    try {
      let { icon, iconPublicId } = skillForm;

      if (skillForm.iconType === 'upload' && skillForm.iconFile) {
        if (iconPublicId) await deleteImage(iconPublicId);
        const res = await uploadImage(skillForm.iconFile, 'portfolio/skills');
        icon = res.secure_url;
        iconPublicId = res.public_id;
      }

      // Separar URLs ya guardadas (no base64) de las que son solo preview
      let certImages = skillForm.certImages.filter(url => url.startsWith('http'));
      let certPublicIds = [...skillForm.certPublicIds];
      // Títulos que corresponden a las URLs ya guardadas (mismo filtro)
      let certTitles = skillForm.certImages.map((url, i) => ({ url, title: skillForm.certTitles[i] || '' }))
        .filter(item => item.url.startsWith('http'))
        .map(item => item.title);

      // Subir solo los archivos nuevos (certFiles)
      if (skillForm.hasCertificate && skillForm.certFiles.length > 0) {
        // Los títulos de los archivos nuevos están al final de certTitles (después de los guardados)
        const newTitles = skillForm.certTitles.slice(
          skillForm.certImages.filter(url => url.startsWith('http')).length
        );
        for (let i = 0; i < skillForm.certFiles.length; i++) {
          const res = await uploadImage(skillForm.certFiles[i], 'portfolio/certificates');
          certImages.push(res.secure_url);
          certPublicIds.push(res.public_id);
          certTitles.push(newTitles[i] || '');
        }
      }

      // Si se desmarcó certificado, eliminar todos de Cloudinary
      if (!skillForm.hasCertificate) {
        for (const pubId of certPublicIds) {
          if (pubId) await deleteImage(pubId);
        }
        certImages = [];
        certPublicIds = [];
        certTitles = [];
      }

      const skillData = { 
        ...skillForm, 
        icon, iconPublicId,
        certImages, certPublicIds, certTitles,
        certImage: certImages[0] || '',
        certPublicId: certPublicIds[0] || '',
        certTitle: certTitles[0] || '',
        iconFile: null, certFile: null, certFiles: []
      };

      const updated = [...sections];
      if (editingId !== null) {
        updated[currentSection].skills[editingId] = skillData;
      } else {
        updated[currentSection].skills.push(skillData);
      }

      await onUpdate({ sections: updated, header: data?.header || headerData });
      resetSkillForm();
    } catch (error) {
      alert('Error al guardar');
    }
  };

  const handleDeleteSkill = async (sectionIndex, skillIndex) => {
    if (window.confirm("¿Eliminar esta habilidad?")) {
      const skill = sections[sectionIndex].skills[skillIndex];
      if (skill?.iconPublicId) await deleteImage(skill.iconPublicId);
      // Eliminar todos los certificados
      if (skill?.certPublicIds?.length) {
        for (const pubId of skill.certPublicIds) {
          if (pubId) await deleteImage(pubId);
        }
      } else if (skill?.certPublicId) {
        await deleteImage(skill.certPublicId);
      }
      const updated = [...sections];
      updated[sectionIndex].skills = updated[sectionIndex].skills.filter((_, i) => i !== skillIndex);
      await onUpdate({ sections: updated, header: data?.header || headerData });
    }
  };

  const resetSkillForm = () => {
    setSkillForm({ 
      name: '', icon: '', iconPublicId: '', iconFile: null, iconType: 'url',
      hasCertificate: false, certTitle: '', certImage: '', certPublicId: '', certFile: null,
      certImages: [], certPublicIds: [], certFiles: [], certTitles: []
    });
    setEditingId(null);
    addSkillModal.close();
    editSkillModal.close();
  };

  const handleSaveHeader = async () => {
    try {
      const textsToTranslate = [headerData.title];
      
      // Solo traducir la descripción si existe contenido
      if (headerData.description && headerData.description.trim()) {
        textsToTranslate.push(headerData.description);
      }
      
      const titleEN = await translate(textsToTranslate[0], { from: "es", to: "en" });
      let descriptionEN = '';
      
      if (textsToTranslate.length > 1) {
        descriptionEN = await translate(textsToTranslate[1], { from: "es", to: "en" });
      }
      
      const updatedHeader = {
        ...headerData,
        titleEN,
        descriptionEN
      };
      
      await onUpdate({ sections, header: updatedHeader });
    } catch (error) {
      await onUpdate({ sections, header: headerData });
    }
    editHeaderModal.close();
  };

  const getVisibleSkills = (skills, sectionIndex) => {
    if (!skills || skills.length === 0) return [];
    
    const section = sections[sectionIndex];
    const rows = section?.rows || 1;
    const currentIndex = currentIndices[sectionIndex] || 0;
    const visiblePerRow = visibleCounts[sectionIndex] || 6;
    const totalVisible = visiblePerRow * rows;
    
    const visible = [];
    for (let i = 0; i < Math.min(totalVisible, skills.length); i++) {
      const index = (currentIndex + i) % skills.length;
      visible.push({ ...skills[index], originalIndex: index });
    }
    
    return visible;
  };

  const needsCarousel = (skills, sectionIndex) => {
    if (!skills) return false;
    const section = sections[sectionIndex];
    const rows = section?.rows || 1;
    const visiblePerRow = visibleCounts[sectionIndex] || 6;
    const totalVisible = visiblePerRow * rows;
    return skills.length > totalVisible;
  };


  return (
    <SectionWrapper id="Habilidades">
      <style>{`
        /* Sobrescribir grid en móviles */
        @media (max-width: 768px) {
          .skills-grid-container {
            display: flex !important;
            flex-direction: column !important;
            gap: 16px !important;
          }
          .skill-section-card {
            grid-row: auto !important;
            grid-column: auto !important;
            width: 100% !important;
            min-height: auto !important;
          }
        }

        /* Drag & Drop mejoras */
        [draggable="true"] {
          cursor: grab;
        }
        
        [draggable="true"]:active {
          cursor: grabbing;
        }
      `}</style>

      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-18 relative z-10">
        
        {/* HEADER */}
        <div className={`flex items-center justify-center gap-6 relative ${
          (headerData.description || headerData.descriptionEN) ? 'mb-8 sm:mb-8' : 'mb-12 md:mb-20'
        }`}>
          <div className="text-center">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none mb-3 transition-all duration-700 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {lang === 'ES' ? (data?.header?.title || 'Habilidades') : (data?.header?.titleEN || 'Skills')}
            </h1>
            <div className={`h-[2px] w-40 bg-gradient-to-r from-transparent via-[#0078C8] to-transparent mx-auto`} />
            
            {(headerData.description || headerData.descriptionEN) && (
              <p className={`mt-6 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {lang === 'ES' ? headerData.description : (headerData.descriptionEN || headerData.description)}
              </p>
            )}
          </div>
          
          {isAdmin && (
            <div className="absolute right-0 flex items-center gap-2">
              <button 
                onClick={() => openSectionModal()}
                className="px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all bg-[#0078C8] text-white hover:bg-[#005A96] opacity-60 hover:opacity-100"
              >
                + Sección
              </button>
              <button 
                onClick={editHeaderModal.open} 
                className={`p-2 rounded-lg transition-all opacity-60 hover:opacity-100 ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-white/60' : 'bg-[var(--color-light-bg-secondary)] hover:bg-[var(--color-light-bg-tertiary)] text-[var(--color-light-text-secondary)]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {sections.length === 0 ? (
          <div className={`text-center py-20 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <p className="text-base">No hay secciones cargadas aún</p>
          </div>
        ) : (
          <div 
            className="relative skills-grid-container"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '24px',
              minHeight: '400px'
            }}
            onDragOver={onDragOverGrid}
            onDrop={onDropGrid}
          >
            {dragOverPosition && isAdmin && draggedSection !== null && (
              <div
                className="absolute border-4 border-dashed border-[#0078C8] bg-[#0078C8]/20 rounded-xl pointer-events-none z-50 animate-pulse"
                style={{
                  gridRow: `${dragOverPosition.row} / span ${sections[draggedSection]?.rows || 1}`,
                  gridColumn: `${dragOverPosition.column} / span ${widthToColumns[sections[draggedSection]?.width] || 12}`,
                  minHeight: `${(sections[draggedSection]?.rows || 1) * 180}px`,
                  boxShadow: '0 0 30px rgba(0, 120, 200, 0.5)'
                }}
              />
            )}

            {sections.map((section, sectionIndex) => {
              const rows = section.rows || 1;
              const columns = widthToColumns[section.width] || 12;
              const gridRow = section.gridRow || 1;
              const gridColumn = section.gridColumn || 1;
              const visibleSkills = getVisibleSkills(section.skills, sectionIndex);
              const showCarousel = needsCarousel(section.skills, sectionIndex);
              
              return (
                <div 
                  key={sectionIndex}
                  className={`skill-section-card group/section space-y-3 relative transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                    isDark ? 'bg-white/[0.02]' : 'bg-[var(--color-light-bg-secondary)]'
                  } rounded-xl p-2 border ${
                    isDark ? 'border-white/5' : 'border-[var(--color-light-border)]'
                  } ${isAdmin ? 'hover:border-[#0078C8]/40' : ''} ${
                    draggedSection === sectionIndex ? 'opacity-50 scale-95' : ''
                  }`}
                  style={{
                    gridRow: `${gridRow} / span ${rows}`,
                    gridColumn: `${gridColumn} / span ${columns}`,
                    minHeight: `${rows * 150}px`
                  }}
                >
                  <div className="flex items-center justify-center mb-2 relative">
                    {isAdmin && (
                      <div className="absolute left-0">
                        <div 
                          draggable
                          onDragStart={(e) => onDragStartSection(e, sectionIndex)}
                          onDragEnd={onDragEnd}
                          className="p-2 cursor-move hover:bg-white/5 rounded-lg transition-colors"
                          title="Arrastra para mover"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                          </svg>
                        </div>
                      </div>
                    )}
                    
                    <h2 className={`text-lg md:text-xl font-bold tracking-tight text-center ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {lang === 'ES' ? section.title : (section.titleEN || section.title)}
                    </h2>
                    
                    {isAdmin && (
                      <div className="absolute right-2 top-0 flex flex-col gap-2 z-20 opacity-0 group-hover/section:opacity-100 transition-all duration-300">
                        <button 
                          onClick={() => openSkillModal(sectionIndex)} 
                          className="p-2 rounded-xl bg-[#469642]/10 text-[#469642] hover:bg-[#469642] hover:text-white transition-all"
                          title="Agregar skill"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => openSectionModal(sectionIndex)} 
                          className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                          title="Editar sección"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteSection(sectionIndex)} 
                          className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          title="Eliminar sección"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="relative group/carousel px-2 py-1" ref={el => containerRefs.current[sectionIndex] = el}>
                    {showCarousel && (
                      <>
                        <button 
                          onClick={() => handleNavigation(sectionIndex, 'prev')} 
                          className="absolute -left-3 md:-left-10 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-[#0078C8] text-white shadow-lg hover:scale-110 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleNavigation(sectionIndex, 'next')} 
                          className="absolute -right-3 md:-right-10 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-[#0078C8] text-white shadow-lg hover:scale-110 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}

                    <div className="overflow-visible">
                      <div 
                        className={`flex flex-wrap justify-center items-center ${isTransitioning[sectionIndex] ? 'transition-transform duration-500 ease-in-out' : ''}`}
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'center',
                          gap: '12px',
                        }}
                      >
                        {visibleSkills.map((skill) => {
                          const actualSkillIndex = skill.originalIndex;

                          return (
                            <div key={`${skill.id || skill.name}-${actualSkillIndex}`} className="flex items-center justify-center"> 
                              {isAdmin && dropTarget.sectionIndex === sectionIndex && dropTarget.skillIndex === actualSkillIndex && !isDraggingSection && (
                                <div className="w-2 h-24 bg-[#0078C8] rounded-full mx-2 shadow-lg shadow-[#0078C8]/50" style={{ animation: 'pulse 1s infinite' }} />
                              )}

                              <div 
                                className="relative w-[100px] h-[120px] group/card transition-all duration-150"
                                draggable={isAdmin && !isDraggingSection}
                                onDragStart={(e) => onDragStartSkill(e, sectionIndex, actualSkillIndex)}
                                onDragOver={(e) => onDragOverSkill(e, sectionIndex, actualSkillIndex)}
                                onDrop={(e) => onDropSkill(e, sectionIndex, actualSkillIndex)}
                                style={{
                                  opacity: draggedSkill?.sectionIndex === sectionIndex && draggedSkill?.skillIndex === actualSkillIndex ? 0.3 : 1,
                                  cursor: isAdmin && !isDraggingSection ? 'grab' : 'default'
                                }}
                              >
                                <div 
                                  className={`relative w-full h-full rounded-lg p-3 flex flex-col items-center justify-center gap-3 border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                                    isDark 
                                      ? 'bg-white/[0.03] border-white/10 hover:border-[#0078C8]/40' 
                                      : 'bg-[var(--color-light-bg-secondary)] border-[var(--color-light-border)] hover:border-[#0078C8]/40 shadow-lg shadow-slate-900/10'
                                  }`}
                                  style={{ cursor: !isAdmin && skill.hasCertificate ? 'pointer' : undefined }}
                                  onClick={() => {
                                    if (!isAdmin && skill.hasCertificate) {
                                      setSelectedCert(skill);
                                      setCertViewIndex(0);
                                      certificateViewModal.open();
                                    }
                                  }}
                                >
                                  {skill.hasCertificate && (
                                    <div className="absolute top-1.5 right-1.5">
                                      <svg className={`w-3.5 h-3.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'} drop-shadow-md`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    </div>
                                  )}
                                  
                                  <img src={skill.icon} alt={skill.name} className="w-12 h-12 object-contain" />
                                  
                                  <span className={`text-sm font-bold text-center leading-tight ${
                                    isDark ? 'text-slate-300' : 'text-slate-700'
                                  }`}>
                                    {skill.name}
                                  </span>

                                  {isAdmin && (
                                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-all duration-300 z-30">
                                      {skill.hasCertificate && (
                                        <button 
                                          onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setSelectedCert(skill);
                                            setCertViewIndex(0);
                                            certificateViewModal.open();
                                          }} 
                                          className="p-2 rounded-xl bg-[#469642]/10 text-[#469642] hover:bg-[#469642] hover:text-white transition-all"
                                          title="Ver Certificado"
                                        >
                                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        </button>
                                      )}
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); openSkillModal(sectionIndex, actualSkillIndex); }} 
                                        className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                                        title="Editar"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteSkill(sectionIndex, actualSkillIndex); }} 
                                        className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                        title="Eliminar"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODALES */}
      <Modal isOpen={addSectionModal.isOpen || editSectionModal.isOpen} onClose={() => { addSectionModal.close(); editSectionModal.close(); }} title={editingId !== null ? "Editar Sección" : "Nueva Sección"} hideClose>
        <div className="space-y-5">
          <Input label="Título" value={sectionForm.title} onChange={e => setSectionForm({...sectionForm, title: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-[#0078C8]">Ancho</label>
              <select 
                value={sectionForm.width} 
                onChange={e => setSectionForm({...sectionForm, width: e.target.value})}
                className={`w-full p-3 rounded-lg border outline-none text-sm ${
                  isDark ? 'bg-[#0F172A] border-white/10 text-white' : 'bg-[var(--color-light-bg-secondary)] border-[var(--color-light-border)] text-[var(--color-light-text-primary)]'
                }`}
              >
                <option value="100%">100% - Completo</option>
                <option value="50%">50% - Mitad</option>
                <option value="33.333%">33% - Tercio</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-[#0078C8]">Filas</label>
              <select 
                value={sectionForm.rows} 
                onChange={e => setSectionForm({...sectionForm, rows: parseInt(e.target.value)})}
                className={`w-full p-3 rounded-lg border outline-none text-sm ${
                  isDark ? 'bg-[#0F172A] border-white/10 text-white' : 'bg-[var(--color-light-bg-secondary)] border-[var(--color-light-border)] text-[var(--color-light-text-primary)]'
                }`}
              >
                {[1,2,3,4,5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={`p-3 rounded-lg text-xs ${isDark ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
            💡 <strong>Grid libre:</strong> Arrastra desde el ícono ☰ para mover. El tamaño (ancho y filas) se mantiene fijo una vez creado.
          </div>

          <div className="flex gap-3 pt-3">
            <Button onClick={saveSectionForm} className="flex-1">{editingId !== null ? 'Guardar' : 'Crear'}</Button>
            <Button onClick={() => { addSectionModal.close(); editSectionModal.close(); }} variant="secondary" className="flex-1">Cancelar</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={addSkillModal.isOpen || editSkillModal.isOpen} onClose={resetSkillForm} title={editingId !== null ? "Editar Habilidad" : "Nueva Habilidad"} hideClose centered>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <Input label="Nombre Skill" value={skillForm.name} onChange={e => setSkillForm({...skillForm, name: e.target.value})} />
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-[#0078C8]">Ícono</label>
            <div className="flex gap-2 mb-2">
              <button onClick={() => setSkillForm({...skillForm, iconType: 'url'})} className={`flex-1 py-2 text-[10px] rounded ${skillForm.iconType === 'url' ? 'bg-[#0078C8] text-white' : 'bg-slate-100'}`}>URL</button>
              <button onClick={() => setSkillForm({...skillForm, iconType: 'upload'})} className={`flex-1 py-2 text-[10px] rounded ${skillForm.iconType === 'upload' ? 'bg-[#0078C8] text-white' : 'bg-slate-100'}`}>SUBIR</button>
            </div>
            {skillForm.iconType === 'url' ? (
              <Input placeholder="URL del ícono" value={skillForm.icon} onChange={e => setSkillForm({...skillForm, icon: e.target.value})} />
            ) : (
              <div className="border-2 border-dashed rounded-lg p-3 text-center">
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files[0], 'icon')} className="hidden" id="skill-icon-up" />
                <label htmlFor="skill-icon-up" className="cursor-pointer">
                  {skillForm.icon ? <img src={skillForm.icon} className="h-10 mx-auto" alt="Icon" /> : <span className="text-xs">Seleccionar</span>}
                </label>
              </div>
            )}
          </div>

          <div className={`p-3 rounded-lg border transition-all ${
            skillForm.hasCertificate 
              ? isDark 
                ? 'border-yellow-400/50 bg-yellow-500/10' 
                : 'border-yellow-400 bg-yellow-50'
              : isDark 
                ? 'border-slate-700 bg-slate-800/30' 
                : 'border-slate-200 bg-slate-50'
          }`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={skillForm.hasCertificate} 
                onChange={e => setSkillForm({...skillForm, hasCertificate: e.target.checked})}
                className="w-4 h-4"
              />
              <span className={`text-xs font-bold uppercase ${
                skillForm.hasCertificate 
                  ? isDark 
                    ? 'text-yellow-300' 
                    : 'text-yellow-600'
                  : isDark
                    ? 'text-slate-300'
                    : 'text-slate-700'
              }`}>¿Certificado?</span>
            </label>

            {skillForm.hasCertificate && (
              <div className="mt-3 space-y-3">

                {/* Grid de certificados ya cargados, cada uno con su título */}
                {skillForm.certImages.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {skillForm.certImages.map((img, idx) => (
                      <div key={idx} className="relative group/cert flex flex-col items-center gap-1" style={{ width: '90px' }}>
                        {/* Thumbnail */}
                        <div className="relative">
                          {img.endsWith('.pdf') || img.startsWith('data:application/pdf') ? (
                            <div className={`w-16 h-20 rounded-lg border flex items-center justify-center text-xs font-bold ${isDark ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
                              📄 PDF
                            </div>
                          ) : (
                            <img src={img} alt={`Cert ${idx + 1}`} className="w-16 h-20 object-cover rounded-lg border" />
                          )}
                          {/* Botón eliminar */}
                          <button 
                            onClick={() => {
                              const isSaved = img.startsWith('http');
                              let newImages = skillForm.certImages.filter((_, i) => i !== idx);
                              let newPubIds = [...skillForm.certPublicIds];
                              let newFiles = [...skillForm.certFiles];
                              let newTitles = skillForm.certTitles.filter((_, i) => i !== idx);

                              if (isSaved) {
                                const savedIndex = skillForm.certImages.slice(0, idx).filter(u => u.startsWith('http')).length;
                                if (newPubIds[savedIndex]) {
                                  deleteImage(newPubIds[savedIndex]);
                                }
                                newPubIds.splice(savedIndex, 1);
                              } else {
                                const previewIndex = skillForm.certImages.slice(0, idx).filter(u => !u.startsWith('http')).length;
                                newFiles.splice(previewIndex, 1);
                              }

                              setSkillForm({...skillForm, certImages: newImages, certPublicIds: newPubIds, certFiles: newFiles, certTitles: newTitles});
                            }}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover/cert:opacity-100 transition-all shadow"
                          >×</button>
                        </div>

                        {/* Input de título por certificado */}
                        <input
                          type="text"
                          placeholder="Título"
                          value={skillForm.certTitles[idx] || ''}
                          onChange={(e) => {
                            const newTitles = [...skillForm.certTitles];
                            newTitles[idx] = e.target.value;
                            setSkillForm({...skillForm, certTitles: newTitles});
                          }}
                          className={getSmallInputClass(isDark)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Botón para agregar más certificados */}
                <div className="border-2 border-dashed rounded-lg p-3 text-center">
                  <input 
                    type="file" accept="image/*,.pdf" multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;
                      const newFiles = [...skillForm.certFiles, ...files];
                      const readers = files.map(file => new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                      }));
                      Promise.all(readers).then(results => {
                        setSkillForm(prev => ({
                          ...prev,
                          certFiles: newFiles,
                          certImages: [...prev.certImages, ...results],
                          certTitles: [...prev.certTitles, ...results.map(() => '')]
                        }));
                      });
                    }}
                    className="hidden" id="cert-up-multi" 
                  />
                  <label htmlFor="cert-up-multi" className="cursor-pointer">
                    <span className="text-xs text-[#0078C8] font-semibold">+ Agregar certificado(s)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-3">
            <Button onClick={saveSkillForm} disabled={uploading} className="flex-1">
              {uploading ? 'Subiendo...' : 'Guardar'}
            </Button>
            <Button onClick={resetSkillForm} variant="secondary" className="flex-1">Cancelar</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={editHeaderModal.isOpen} onClose={editHeaderModal.close} title="Editar Configuración" hideClose>
        <div className="space-y-5">
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
          <Button onClick={handleSaveHeader} className="w-full">Guardar</Button>
        </div>
      </Modal>

      {/* MODAL VISTA CERTIFICADO */}
      <Modal
        isOpen={certificateViewModal.isOpen}
        onClose={certificateViewModal.close}
        centered
        maxWidth="max-w-[90vw]"
        hideHeader
      >
        {selectedCert && (() => {
          const certs = selectedCert?.certImages?.length ? selectedCert.certImages : (selectedCert?.certImage ? [selectedCert.certImage] : []);
          const titles = selectedCert?.certTitles?.length ? selectedCert.certTitles : (selectedCert?.certTitle ? certs.map(() => selectedCert.certTitle) : []);
          const currentCert = certs[certViewIndex] || '';
          const currentTitle = titles[certViewIndex] || selectedCert?.certTitle || selectedCert?.name || '';
          const hasMultiple = certs.length > 1;

          const isPdf = currentCert.endsWith('.pdf') || currentCert.startsWith('data:application/pdf');
          const isCloudinaryPdf = isPdf && currentCert.startsWith('http');
          const displaySrc = isCloudinaryPdf
            ? currentCert.replace(/\.pdf(\?.*)?$/, '.jpg$1')
            : currentCert;
          const useIframe = isPdf && !isCloudinaryPdf;

          return (
            <div className="relative w-full h-[80vh] flex flex-col items-center">
              <button 
                onClick={certificateViewModal.close}
                className="absolute top-0 -right-2 md:right-2 p-2 rounded-full transition-all duration-300 z-[70] shadow-xl backdrop-blur-md bg-red-500 text-white"
              >
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-2 text-center px-4">
                <h3 className={`text-xl sm:text-2xl md:text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {currentTitle}
                </h3>
              </div>

              <div 
                className="relative flex-1 w-full bg-black/5 rounded-3xl overflow-hidden flex items-center justify-center"
                onWheel={e => {
                  e.preventDefault();
                  setCertZoom(prev => {
                    const next = prev + (e.deltaY < 0 ? 0.1 : -0.1);
                    return Math.min(5, Math.max(1, parseFloat(next.toFixed(2))));
                  });
                }}
              >
                {useIframe ? (
                  <iframe 
                    src={currentCert} 
                    title="PDF"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                ) : (
                  <img 
                    src={displaySrc} 
                    alt="Certificado" 
                    className="select-none"
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      objectFit: 'contain',
                      transform: `scale(${certZoom})`,
                      transition: 'transform 0.15s ease-out'
                    }}
                    draggable={false}
                  />
                )}

                {hasMultiple && (
                  <>
                    <button
                      onClick={() => { setCertViewIndex(prev => (prev - 1 + certs.length) % certs.length); setCertZoom(1); }}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-[#0078C8] text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all z-50 backdrop-blur-md"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => { setCertViewIndex(prev => (prev + 1) % certs.length); setCertZoom(1); }}
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
          );
        })()}
      </Modal>
    </SectionWrapper>
  );
}