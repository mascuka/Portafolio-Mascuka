import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useModal } from '../hooks/useModal';
import { useCloudinary } from '../hooks/useCloudinary';
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
  const [flippedCard, setFlippedCard] = useState({ sIdx: null, skIdx: null });
  const [selectedCert, setSelectedCert] = useState(null);
  const [draggedSkill, setDraggedSkill] = useState(null);
  const [dropTarget, setDropTarget] = useState({ sectionIndex: null, skillIndex: null });
  const [currentIndices, setCurrentIndices] = useState({});
  const [isTransitioning, setIsTransitioning] = useState({});
  const [visibleCounts, setVisibleCounts] = useState({});
  
  const containerRefs = useRef({});
  
  const [skillForm, setSkillForm] = useState({ 
    name: '', icon: '', iconPublicId: '', iconFile: null, iconType: 'url',
    hasCertificate: false, certTitle: '', certImage: '', certPublicId: '', certFile: null
  });
  
  const [sectionForm, setSectionForm] = useState({ title: '', titleEN: '', rows: 1 });
  const [headerData, setHeaderData] = useState({ title: 'Habilidades', titleEN: 'Skills' });

  const sections = data?.sections || [];

  // Calcular cuántas cards caben en el contenedor
  const calculateVisibleCount = (sectionIndex) => {
    const container = containerRefs.current[sectionIndex];
    if (!container) return 1;

    const section = sections[sectionIndex];
    const rows = section?.rows || 1;
    
    const cardWidth = 152; // w-38 = 152px
    const gap = 32; // gap-8 = 32px
    const padding = 64; // padding interno para expansión de cards
    
    const availableWidth = container.offsetWidth - padding;
    const cardsPerRow = Math.floor((availableWidth + gap) / (cardWidth + gap));
    
    return Math.max(1, cardsPerRow);
  };

  // Recalcular counts cuando cambia el tamaño
  useEffect(() => {
    const updateCounts = () => {
      const newCounts = {};
      sections.forEach((_, idx) => {
        newCounts[idx] = calculateVisibleCount(idx);
      });
      setVisibleCounts(newCounts);
    };

    updateCounts();
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
    const visiblePerRow = visibleCounts[sectionIndex] || 1;
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
      setEditingId(index);
      setSectionForm({ 
        title: sections[index].title, 
        titleEN: sections[index].titleEN,
        rows: sections[index].rows || 1
      });
      editSectionModal.open();
    } else {
      setEditingId(null);
      setSectionForm({ title: '', titleEN: '', rows: 1 });
      addSectionModal.open();
    }
  };

  const saveSectionForm = async () => {
    if (!sectionForm.title) return alert("Completa el título");
    const updated = [...sections];
    
    if (editingId !== null) {
      updated[editingId] = { ...updated[editingId], ...sectionForm };
    } else {
      updated.push({ ...sectionForm, skills: [] });
    }
    
    await onUpdate({ sections: updated, header: data?.header || headerData });
    setSectionForm({ title: '', titleEN: '', rows: 1 });
    setEditingId(null);
    addSectionModal.close();
    editSectionModal.close();
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

  const moveSection = (index, direction) => {
    const updated = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onUpdate({ sections: updated, header: data?.header || headerData });
  };

  const onDragStartSkill = (sectionIndex, skillIndex) => {
    setDraggedSkill({ sectionIndex, skillIndex });
  };

  const onDragOverSkill = (e, sectionIndex, skillIndex) => {
    e.preventDefault();
    if (!draggedSkill || draggedSkill.sectionIndex !== sectionIndex) return;
    setDropTarget({ sectionIndex, skillIndex });
  };

  const onDropSkill = (targetSectionIndex, targetSkillIndex) => {
    if (!draggedSkill || draggedSkill.sectionIndex !== targetSectionIndex) {
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
    const updatedHeader = { ...headerData, titleEN: headerData.title };
    await onUpdate({ sections, header: updatedHeader });
    editHeaderModal.close();
  };

  const toggleFlip = (sIdx, skIdx) => {
    setFlippedCard(flippedCard.sIdx === sIdx && flippedCard.skIdx === skIdx 
      ? { sIdx: null, skIdx: null } 
      : { sIdx, skIdx });
  };

  const getVisibleSkills = (skills, sectionIndex) => {
    if (!skills || skills.length === 0) return [];
    
    const section = sections[sectionIndex];
    const rows = section?.rows || 1;
    const currentIndex = currentIndices[sectionIndex] || 0;
    const visiblePerRow = visibleCounts[sectionIndex] || 1;
    const totalVisible = visiblePerRow * rows;
    
    const visible = [];
    for (let i = 0; i < totalVisible && i < skills.length; i++) {
      const index = (currentIndex + i) % skills.length;
      visible.push({ ...skills[index], originalIndex: index });
    }
    
    return visible;
  };

  const needsCarousel = (skills, sectionIndex) => {
    if (!skills) return false;
    const section = sections[sectionIndex];
    const rows = section?.rows || 1;
    const visiblePerRow = visibleCounts[sectionIndex] || 1;
    const totalVisible = visiblePerRow * rows;
    return skills.length > totalVisible;
  };

  return (
    <SectionWrapper id="Habilidades">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-24 xl:px-32 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none mb-3 transition-all duration-700 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {lang === 'ES' ? (data?.header?.title || 'Habilidades') : (data?.header?.titleEN || 'Skills')}
            </h1>
            <div className={`h-[2px] w-32 bg-gradient-to-r to-transparent from-[#0078C8]`} />
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <button 
                  onClick={() => openSectionModal()}
                  className="px-6 py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 hover:-translate-y-0.5 bg-[#0078C8] text-white border border-[#0078C8] hover:bg-[#005A96] shadow-lg shadow-[#0078C8]/20"
                >
                  + Nueva Sección
                </button>
                <button onClick={editHeaderModal.open} className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${isDark ? 'bg-white/5 text-white/40 hover:text-[#0078C8]' : 'bg-slate-100 text-slate-400 hover:text-[#0078C8]'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              </>
            )}
          </div>
        </div>

        {sections.length === 0 ? (
          <div className={`text-center py-32 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <p className="text-lg">No hay secciones cargadas aún</p>
          </div>
        ) : (
          <div className="space-y-12"> 
            {sections.map((section, sectionIndex) => {
              const rows = section.rows || 1;
              const visibleSkills = getVisibleSkills(section.skills, sectionIndex);
              const showCarousel = needsCarousel(section.skills, sectionIndex);
              
              return (
                <div key={sectionIndex} className="group/section space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h2 className={`text-xl md:text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {lang === 'ES' ? section.title : (section.titleEN || section.title)}
                      </h2>
                      {isAdmin && (
                        <div className="flex gap-1 items-center bg-slate-100/50 dark:bg-white/5 p-1 rounded-lg border border-slate-200 dark:border-white/10 ml-2">
                          <button 
                            onClick={() => moveSection(sectionIndex, 'up')} 
                            disabled={sectionIndex === 0} 
                            className={`p-1 rounded transition-colors ${isDark ? 'text-white hover:bg-white/10' : 'text-slate-900 hover:bg-slate-200'} disabled:opacity-20`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </button>
                          <button 
                            onClick={() => moveSection(sectionIndex, 'down')} 
                            disabled={sectionIndex === sections.length - 1} 
                            className={`p-1 rounded transition-colors ${isDark ? 'text-white hover:bg-white/10' : 'text-slate-900 hover:bg-slate-200'} disabled:opacity-20`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </button>
                          <div className="w-[1px] h-4 bg-slate-300 dark:bg-white/20 mx-1" />
                          <button onClick={() => openSectionModal(sectionIndex)} className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" /></svg></button>
                          <button onClick={() => handleDeleteSection(sectionIndex)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                          <button onClick={() => openSkillModal(sectionIndex)} className="ml-1 px-2 py-0.5 bg-[#0078C8] text-white text-[9px] font-black rounded uppercase tracking-tighter hover:bg-[#005A96] transition-colors">+ Skill</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative group/carousel" ref={el => containerRefs.current[sectionIndex] = el}>
                    {showCarousel && (
                      <>
                        <button 
                          onClick={() => handleNavigation(sectionIndex, 'prev')} 
                          className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-[#0078C8] text-white shadow-xl hover:scale-110 transition-all active:scale-95"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button 
                          onClick={() => handleNavigation(sectionIndex, 'next')} 
                          className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-[#0078C8] text-white shadow-xl hover:scale-110 transition-all active:scale-95"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </>
                    )}

                    <div className="overflow-hidden py-8 px-8">
                      <div 
                        className={`grid gap-8 ${isTransitioning[sectionIndex] ? 'transition-all duration-500 ease-in-out' : ''}`}
                        style={{ 
                          gridTemplateRows: `repeat(${rows}, 1fr)`,
                          gridAutoFlow: 'column',
                          gridAutoColumns: '152px'
                        }}
                      >
                        // CONTINUACIÓN PARTE 2 - Desde el grid de skills

                        {visibleSkills.map((skill, idx) => {
                          const actualSkillIndex = skill.originalIndex;
                          const isFlipped = flippedCard.sIdx === sectionIndex && flippedCard.skIdx === actualSkillIndex;

                          return (
                            <div key={`${skill.id || skill.name}-${actualSkillIndex}`} className="flex items-center justify-center"> 
                              {isAdmin && dropTarget.sectionIndex === sectionIndex && dropTarget.skillIndex === actualSkillIndex && (
                                <div className="w-1 h-24 bg-[#0078C8] rounded-full mx-2 animate-pulse" />
                              )}

                              <div 
                                className="relative w-38 h-44 perspective-1000 group/card"
                                draggable={isAdmin}
                                onDragStart={() => onDragStartSkill(sectionIndex, actualSkillIndex)}
                                onDragOver={(e) => onDragOverSkill(e, sectionIndex, actualSkillIndex)}
                                onDrop={() => onDropSkill(sectionIndex, actualSkillIndex)}
                              >
                                <div className="absolute inset-0 blur-[60px] opacity-0 group-hover/card:opacity-20 transition-all duration-1000 bg-[#0078C8]" />
                                
                                <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180 scale-105' : 'group-hover/card:scale-105'}`}>
                                  
                                  {/* LADO FRONTAL */}
                                  <div 
                                    onClick={() => skill.hasCertificate && toggleFlip(sectionIndex, actualSkillIndex)}
                                    className={`absolute inset-0 backface-hidden rounded-2xl p-4 flex flex-col items-center justify-center gap-3 border transition-all duration-500 ${
                                      isDark ? 'bg-white/[0.03] border-white/10 group-hover/card:border-[#0078C8]/40' : 'bg-white border-slate-200 shadow-sm group-hover/card:border-[#0078C8]/40'
                                    } ${skill.hasCertificate ? 'cursor-pointer' : 'cursor-default'}`}
                                  >
                                    {skill.hasCertificate && (
                                      <div className="absolute top-2 right-2">
                                        <div className="relative">
                                          <div className={`absolute inset-0 blur-md opacity-40 animate-pulse ${isDark ? 'bg-yellow-400' : 'bg-yellow-600'}`}></div>
                                          <svg className={`w-4 h-4 relative drop-shadow-md ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        </div>
                                      </div>
                                    )}
                                    
                                    <img src={skill.icon} alt={skill.name} className="w-14 h-14 object-contain transition-transform duration-500 group-hover/card:scale-110" />
                                    
                                    <div className="flex flex-col items-center w-full">
                                      <span className={`text-[11px] font-black uppercase tracking-widest text-center transition-colors leading-tight ${isDark ? 'text-slate-300 group-hover/card:text-[#0078C8]' : 'text-slate-700 group-hover/card:text-[#0078C8]'}`}>
                                        {skill.name}
                                      </span>
                                      <div className={`h-[1.5px] mt-1.5 w-1/3 transition-all duration-500 bg-gradient-to-r from-[#0078C8] to-transparent group-hover/card:w-full`} />
                                    </div>

                                    {isAdmin && (
                                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-30">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); openSkillModal(sectionIndex, actualSkillIndex); }} 
                                          className="bg-slate-800/90 hover:bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded transition-all"
                                        >
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" /></svg>
                                        </button>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleDeleteSkill(sectionIndex, actualSkillIndex); }} 
                                          className="bg-slate-800/90 hover:bg-red-600 text-white w-6 h-6 flex items-center justify-center rounded transition-all"
                                        >
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* LADO POSTERIOR (CERTIFICADO) */}
                                  <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-3 flex flex-col items-center justify-between border ${
                                    isDark ? 'bg-slate-900 border-[#0078C8]' : 'bg-white border-[#0078C8]'
                                  }`}>
                                    <div className="w-full h-20 overflow-hidden rounded-lg relative group/cert bg-slate-100 flex items-center justify-center">
                                      {skill.certImage?.includes('pdf') ? (
                                        <div className="flex flex-col items-center text-[#0078C8]">
                                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414L14.586 2H9z" /><path d="M5 6a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V8a2 2 0 00-2-2H5z" /></svg>
                                          <span className="text-[7px] font-bold mt-1">PDF</span>
                                        </div>
                                      ) : (
                                        <img src={skill.certImage} className="w-full h-full object-cover" alt="Certificado" />
                                      )}
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setSelectedCert(skill); certificateViewModal.open(); }}
                                        className="absolute inset-0 bg-[#0078C8]/60 opacity-0 group-hover/cert:opacity-100 flex items-center justify-center transition-opacity"
                                      >
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth="2" /></svg>
                                      </button>
                                    </div>
                                    <p className="text-[8px] font-black uppercase text-center leading-tight line-clamp-2 text-[#0078C8] px-1">
                                      {skill.certTitle || 'Certificado'}
                                    </p>
                                    <button 
                                      onClick={() => toggleFlip(sectionIndex, actualSkillIndex)}
                                      className={`text-[8px] font-black px-3 py-1 rounded-full border-2 border-[#0078C8] text-[#0078C8] hover:bg-[#0078C8] hover:text-white transition-colors`}
                                    >
                                      VOLVER
                                    </button>
                                  </div>

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
        <div className="space-y-6">
          <Input label="Título (Español)" value={sectionForm.title} onChange={e => setSectionForm({...sectionForm, title: e.target.value})} />
          <Input label="Título (Inglés)" value={sectionForm.titleEN} onChange={e => setSectionForm({...sectionForm, titleEN: e.target.value})} />
          
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#0078C8]' : 'text-[#0078C8]'}`}>
              Número de Filas
            </label>
            <select 
              value={sectionForm.rows} 
              onChange={e => setSectionForm({...sectionForm, rows: parseInt(e.target.value)})}
              className={`w-full p-3 rounded-xl border-2 outline-none transition-all text-sm ${isDark ? 'bg-[#0F172A] border-white/10 text-white focus:border-[#0078C8]' : 'bg-white border-slate-200 text-slate-900 focus:border-[#0078C8]'}`}
            >
              <option value="1">1 Fila (Horizontal)</option>
              <option value="2">2 Filas</option>
              <option value="3">3 Filas</option>
              <option value="4">4 Filas</option>
            </select>
            <p className="text-xs text-slate-500">Las skills se distribuirán en el número de filas seleccionado</p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={saveSectionForm} className="flex-1">{editingId !== null ? 'Guardar' : 'Crear'}</Button>
            <Button onClick={() => { addSectionModal.close(); editSectionModal.close(); }} variant="secondary" className="flex-1">Cancelar</Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={addSkillModal.isOpen || editSkillModal.isOpen} 
        onClose={resetSkillForm} 
        title={editingId !== null ? "Editar Habilidad" : "Nueva Habilidad"}
        hideClose
        centered
      >
        <div className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
          <Input label="Nombre Skill" value={skillForm.name} onChange={e => setSkillForm({...skillForm, name: e.target.value})} />
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-[#0078C8]">Ícono Principal</label>
            <div className="flex gap-2 mb-2">
              <button onClick={() => setSkillForm({...skillForm, iconType: 'url'})} className={`flex-1 py-2 text-[10px] rounded ${skillForm.iconType === 'url' ? 'bg-[#0078C8] text-white' : 'bg-slate-100'}`}>URL</button>
              <button onClick={() => setSkillForm({...skillForm, iconType: 'upload'})} className={`flex-1 py-2 text-[10px] rounded ${skillForm.iconType === 'upload' ? 'bg-[#0078C8] text-white' : 'bg-slate-100'}`}>SUBIR</button>
            </div>
            {skillForm.iconType === 'url' ? (
              <Input placeholder="URL del ícono" value={skillForm.icon} onChange={e => setSkillForm({...skillForm, icon: e.target.value})} />
            ) : (
              <div className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer">
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files[0], 'icon')} className="hidden" id="skill-icon-up" />
                <label htmlFor="skill-icon-up" className="cursor-pointer">
                  {skillForm.icon ? <img src={skillForm.icon} className="h-12 mx-auto" alt="Icono Preview" /> : <span className="text-xs">Seleccionar Imagen</span>}
                </label>
              </div>
            )}
          </div>

          <div className={`p-4 rounded-xl border-2 transition-all relative overflow-hidden ${skillForm.hasCertificate ? 'border-yellow-400/60 bg-gradient-to-br from-yellow-400/10 to-orange-500/5' : isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'}`}>
            {skillForm.hasCertificate && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl"></div>
            )}
            
            <label className="flex items-center gap-3 cursor-pointer relative z-10">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={skillForm.hasCertificate} 
                  onChange={e => setSkillForm({...skillForm, hasCertificate: e.target.checked})}
                  className="peer sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-all ${skillForm.hasCertificate ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${skillForm.hasCertificate ? 'translate-x-6' : ''}`}></div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-tight ${skillForm.hasCertificate ? 'text-yellow-600' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  ¿Certificado?
                </span>
              </div>
            </label>

            {skillForm.hasCertificate && (
              <div className="mt-4 space-y-4 animate-fadeIn relative z-10">
                <Input label="Título del Certificado" value={skillForm.certTitle} onChange={e => setSkillForm({...skillForm, certTitle: e.target.value})} />
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[#0078C8]">Imagen o PDF del Certificado</label>
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${isDark ? 'border-yellow-400/30 bg-yellow-400/5' : 'border-yellow-500/40 bg-yellow-50'}`}>
                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e.target.files[0], 'certImage')} className="hidden" id="cert-up" />
                    <label htmlFor="cert-up" className="cursor-pointer">
                      {skillForm.certImage ? (
                        skillForm.certImage.includes('pdf') ? (
                          <div className="text-yellow-600 font-bold text-xs flex flex-col items-center">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414L14.586 2H9z" /></svg>
                            Archivo PDF Cargado
                          </div>
                        ) : (
                          <img src={skillForm.certImage} className="h-20 mx-auto rounded shadow-lg" alt="Certificado Preview" />
                        )
                      ) : <span className="text-xs text-yellow-700 font-semibold">📄 Subir Certificado (IMG o PDF)</span>}
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={saveSkillForm} disabled={uploading} className="flex-1">
              {uploading ? 'Subiendo...' : 'Guardar'}
            </Button>
            <Button onClick={resetSkillForm} variant="secondary" className="flex-1">Cancelar</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={editHeaderModal.isOpen} onClose={editHeaderModal.close} title="Editar Título" hideClose>
        <div className="space-y-6">
          <Input label="Título" value={headerData.title} onChange={(e) => setHeaderData({...headerData, title: e.target.value})} />
          <Button onClick={handleSaveHeader} className="w-full">Guardar</Button>
        </div>
      </Modal>

      {/* Visor de Certificado */}
      <Modal isOpen={certificateViewModal.isOpen} onClose={certificateViewModal.close} title={selectedCert?.certTitle} hideClose centered>
        <div className="flex flex-col items-center w-full">
          {selectedCert?.certImage?.includes('.pdf') ? (
            <iframe src={selectedCert.certImage} className="w-full h-[70vh] rounded-lg" title="PDF Certificado"></iframe>
          ) : (
            <img src={selectedCert?.certImage} className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-2xl" alt="Certificado Full" />
          )}
          <Button onClick={certificateViewModal.close} className="mt-6 w-full">Cerrar Visor</Button>
        </div>
      </Modal>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </SectionWrapper>
  );
}