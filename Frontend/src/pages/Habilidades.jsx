import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useModal } from '../hooks/useModal';
import { useCloudinary } from '../hooks/useCloudinary';
import translate from 'translate';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import SectionWrapper from '../components/SectionWrapper';

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
    hasCertificate: false, certTitle: '', certImage: '', certPublicId: '', certFile: null
  });
  
  const [sectionForm, setSectionForm] = useState({ 
    title: '', 
    rows: 1, 
    width: '100%',
    gridRow: 1,
    gridColumn: 1
  });
  
  const [headerData, setHeaderData] = useState({ title: 'Habilidades' });

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
        if (skill?.certPublicId) await deleteImage(skill.certPublicId);
      }
      const updated = sections.filter((_, i) => i !== index);
      await onUpdate({ sections: updated, header: data?.header || headerData });
    }
  };

  const onDragStartSection = (e, index) => {
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

    const column = Math.max(1, Math.min(12, Math.floor(x / columnWidth) + 1));
    const row = Math.max(1, Math.floor(y / rowHeight) + 1);

    const draggedSectionData = sections[draggedSection];
    const cols = widthToColumns[draggedSectionData.width] || 12;
    const rows = draggedSectionData.rows || 1;

    if (column + cols - 1 > 12) return;

    const hasCollision = sections.some((section, idx) => {
      if (idx === draggedSection) return false;
      
      const sRow = section.gridRow || 1;
      const sCol = section.gridColumn || 1;
      const sRows = section.rows || 1;
      const sCols = widthToColumns[section.width] || 12;

      const rowOverlap = !(row + rows - 1 < sRow || row > sRow + sRows - 1);
      const colOverlap = !(column + cols - 1 < sCol || column > sCol + sCols - 1);

      return rowOverlap && colOverlap;
    });

    if (!hasCollision) {
      setDragOverPosition({ row, column });
    } else {
      setDragOverPosition(null);
    }
  };

  const onDropGrid = () => {
    if (draggedSection === null) {
      setDraggedSection(null);
      setDragOverPosition(null);
      setIsDraggingSection(false);
      setOriginalPosition(null);
      return;
    }

    if (!dragOverPosition) {
      const updated = [...sections];
      updated[draggedSection] = {
        ...updated[draggedSection],
        gridRow: originalPosition.gridRow,
        gridColumn: originalPosition.gridColumn
      };
      onUpdate({ sections: updated, header: data?.header || headerData });
      setDraggedSection(null);
      setDragOverPosition(null);
      setIsDraggingSection(false);
      setOriginalPosition(null);
      return;
    }

    const updated = [...sections];
    updated[draggedSection] = {
      ...updated[draggedSection],
      gridRow: dragOverPosition.row,
      gridColumn: dragOverPosition.column
    };
    
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
    if (isDraggingSection) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    setDraggedSkill({ sectionIndex, skillIndex });
  };

  const onDragOverSkill = (e, sectionIndex, skillIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedSkill || draggedSkill.sectionIndex !== sectionIndex || isDraggingSection) return;
    setDropTarget({ sectionIndex, skillIndex });
  };

  const onDropSkill = (e, targetSectionIndex, targetSkillIndex) => {
    e.stopPropagation();
    if (!draggedSkill || draggedSkill.sectionIndex !== targetSectionIndex || isDraggingSection) {
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
      setSkillForm({ 
        ...skill, 
        iconFile: null, 
        certFile: null,
        iconType: skill.iconPublicId ? 'upload' : 'url'
      });
      setEditingId(skillIndex);
      editSkillModal.open();
    } else {
      setSkillForm({ 
        name: '', icon: '', iconPublicId: '', iconFile: null, iconType: 'url',
        hasCertificate: false, certTitle: '', certImage: '', certPublicId: '', certFile: null 
      });
      setEditingId(null);
      addSkillModal.open();
    }
  };

  const saveSkillForm = async () => {
    if (!skillForm.name || (!skillForm.icon && !skillForm.iconFile)) 
      return alert("Completa campos básicos");
    if (skillForm.hasCertificate && !skillForm.certFile && !skillForm.certImage) 
      return alert("Carga el certificado");

    try {
      let { icon, iconPublicId, certImage, certPublicId } = skillForm;

      if (skillForm.iconType === 'upload' && skillForm.iconFile) {
        if (iconPublicId) await deleteImage(iconPublicId);
        const res = await uploadImage(skillForm.iconFile, 'portfolio/skills');
        icon = res.secure_url;
        iconPublicId = res.public_id;
      }

      if (skillForm.hasCertificate && skillForm.certFile) {
        if (certPublicId) await deleteImage(certPublicId);
        const res = await uploadImage(skillForm.certFile, 'portfolio/certificates');
        certImage = res.secure_url;
        certPublicId = res.public_id;
      }

      const skillData = { 
        ...skillForm, 
        icon, iconPublicId, certImage, certPublicId,
        iconFile: null, certFile: null 
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
      if (skill?.certPublicId) await deleteImage(skill.certPublicId);
      const updated = [...sections];
      updated[sectionIndex].skills = updated[sectionIndex].skills.filter((_, i) => i !== skillIndex);
      await onUpdate({ sections: updated, header: data?.header || headerData });
    }
  };

  const resetSkillForm = () => {
    setSkillForm({ 
      name: '', icon: '', iconPublicId: '', iconFile: null, iconType: 'url',
      hasCertificate: false, certTitle: '', certImage: '', certPublicId: '', certFile: null 
    });
    setEditingId(null);
    addSkillModal.close();
    editSkillModal.close();
  };

  const handleSaveHeader = async () => {
    try {
      const titleEN = await translate(headerData.title, { from: "es", to: "en" });
      await onUpdate({ sections, header: { ...headerData, titleEN } });
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
      `}</style>

      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-18 relative z-10">
        
        {/* HEADER */}
        <div className="flex items-center justify-center gap-6 mb-12 md:mb-20 relative">
          <div className="text-center">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none mb-3 transition-all duration-700 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {lang === 'ES' ? (data?.header?.title || 'Habilidades') : (data?.header?.titleEN || 'Skills')}
            </h1>
            <div className={`h-[2px] w-40 bg-gradient-to-r from-transparent via-[#0078C8] to-transparent mx-auto`} />
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
            {dragOverPosition && isAdmin && (
              <div
                className="absolute border-2 border-dashed border-[#0078C8] bg-[#0078C8]/10 rounded-xl pointer-events-none z-0"
                style={{
                  gridRow: `${dragOverPosition.row} / span ${sections[draggedSection]?.rows || 1}`,
                  gridColumn: `${dragOverPosition.column} / span ${widthToColumns[sections[draggedSection]?.width] || 12}`,
                  minHeight: `${(sections[draggedSection]?.rows || 1) * 180}px`
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
                  className={`skill-section-card group/section space-y-3 relative transition-all duration-200 ${
                    isDark ? 'bg-white/[0.02]' : 'bg-white'
                  } rounded-xl p-2 border ${
                    isDark ? 'border-white/5' : 'border-slate-200'
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
                      <div className="absolute right-0 flex gap-1.5 items-center p-1.5 rounded-lg backdrop-blur-sm bg-gradient-to-r from-slate-900/60 to-slate-800/60 border border-white/10 shadow-lg">
                        <button 
                          onClick={() => openSectionModal(sectionIndex)} 
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-md transition-all"
                          title="Editar sección"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" />
                          </svg>
                        </button>
                        <div className="w-px h-5 bg-white/20"></div>
                        <button 
                          onClick={() => handleDeleteSection(sectionIndex)} 
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-all"
                          title="Eliminar sección"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <div className="w-px h-5 bg-white/20"></div>
                        <button 
                          onClick={() => openSkillModal(sectionIndex)} 
                          className="px-3 py-1.5 bg-gradient-to-r from-[#0078C8] to-[#005A96] text-white text-[9px] font-bold rounded-md uppercase hover:from-[#005A96] hover:to-[#004070] transition-all shadow-md hover:shadow-lg"
                          title="Agregar skill"
                        >
                          + Skill
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
                                <div className="w-1 h-20 bg-[#0078C8] rounded-full mx-2 animate-pulse" />
                              )}

                              <div 
                                className="relative w-[100px] h-[120px] group/card"
                                draggable={isAdmin && !isDraggingSection}
                                onDragStart={(e) => onDragStartSkill(e, sectionIndex, actualSkillIndex)}
                                onDragOver={(e) => onDragOverSkill(e, sectionIndex, actualSkillIndex)}
                                onDrop={(e) => onDropSkill(e, sectionIndex, actualSkillIndex)}
                              >
                                <div 
                                  onClick={(e) => {
                                    if (skill.hasCertificate) {
                                      e.stopPropagation();
                                      setSelectedCert(skill);
                                      certificateViewModal.open();
                                    }
                                  }}
                                  className={`relative w-full h-full rounded-lg p-3 flex flex-col items-center justify-center gap-2 border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                                    isDark 
                                      ? 'bg-white/[0.03] border-white/10 hover:border-[#0078C8]/40' 
                                      : 'bg-white border-slate-200 hover:border-[#0078C8]/40 shadow-sm'
                                  } ${skill.hasCertificate ? 'cursor-pointer' : ''}`}
                                >
                                  {skill.hasCertificate && (
                                    <div className="absolute top-1.5 right-1.5">
                                      <svg className={`w-3.5 h-3.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'} drop-shadow-md`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    </div>
                                  )}
                                  
                                  <img src={skill.icon} alt={skill.name} className="w-12 h-12 object-contain" />
                                  
                                  <span className={`text-[11px] font-bold text-center leading-tight ${
                                    isDark ? 'text-slate-300' : 'text-slate-700'
                                  }`}>
                                    {skill.name}
                                  </span>

                                  {isAdmin && (
                                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-30">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); openSkillModal(sectionIndex, actualSkillIndex); }} 
                                        className="bg-slate-800/90 hover:bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded transition-all"
                                      >
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" />
                                        </svg>
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteSkill(sectionIndex, actualSkillIndex); }} 
                                        className="bg-slate-800/90 hover:bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded transition-all"
                                      >
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
                  isDark ? 'bg-[#0F172A] border-white/10 text-white' : 'bg-white border-slate-200'
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
                  isDark ? 'bg-[#0F172A] border-white/10 text-white' : 'bg-white border-slate-200'
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
                <Input label="Título del Certificado" value={skillForm.certTitle} onChange={e => setSkillForm({...skillForm, certTitle: e.target.value})} />
                <div className="border-2 border-dashed rounded-lg p-3 text-center">
                  <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e.target.files[0], 'certImage')} className="hidden" id="cert-up" />
                  <label htmlFor="cert-up" className="cursor-pointer">
                    {skillForm.certImage ? (
                      skillForm.certImage.includes('pdf') ? (
                        <div className="text-xs font-bold">📄 PDF Cargado</div>
                      ) : (
                        <img src={skillForm.certImage} className="h-16 mx-auto rounded" alt="Cert" />
                      )
                    ) : <span className="text-xs">📄 Subir Certificado</span>}
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

      <Modal isOpen={editHeaderModal.isOpen} onClose={editHeaderModal.close} title="Editar Título" hideClose>
        <div className="space-y-5">
          <Input label="Título" value={headerData.title} onChange={(e) => setHeaderData({...headerData, title: e.target.value})} />
          <Button onClick={handleSaveHeader} className="w-full">Guardar</Button>
        </div>
      </Modal>

      <Modal isOpen={certificateViewModal.isOpen} onClose={certificateViewModal.close} title={selectedCert?.certTitle || selectedCert?.name} hideClose centered>
        <div className="flex flex-col items-center w-full">
          {selectedCert?.certImage?.includes('.pdf') ? (
            <iframe src={selectedCert.certImage} className="w-full h-[70vh] rounded-lg" title="PDF"></iframe>
          ) : (
            <img src={selectedCert?.certImage} className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-xl" alt="Certificado" />
          )}
          <Button onClick={certificateViewModal.close} className="mt-5 w-full">Cerrar</Button>
        </div>
      </Modal>
    </SectionWrapper>
  );
}