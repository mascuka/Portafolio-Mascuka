import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import translate from 'translate';
import emailjs from '@emailjs/browser';
import ImageUploader from '../components/ImageUploader';
import CVUploader from '../components/CVUploader';

export default function Home({ data, cvUrl, onUpdate, onUpdateCV }) {
  const { isDark, lang, isAdmin } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', subtitle: '', description: '', image: '', imagePublicId: '',
    email: '', whatsapp: '', linkedin: '', cvPublicId: '',
    mailSuccessImage: '', mailSuccessPublicId: ''
  });
  const [isVisible, setIsVisible] = useState(false);
  const [showMailModal, setShowMailModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [mailStatus, setMailStatus] = useState({ show: false, success: true, text: '' });
  const mailForm = useRef();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    if (data) {
      setFormData({ 
        title: data.title || '', subtitle: data.subtitle || '', description: data.description || '', 
        image: data.image || '', imagePublicId: data.imagePublicId || '',
        whatsapp: data.whatsapp || '', linkedin: data.linkedin || '', email: data.email || '',
        cvPublicId: data.cvPublicId || '',
        mailSuccessImage: data.mailSuccessImage || '',
        mailSuccessPublicId: data.mailSuccessPublicId || ''
      });
    }
  }, [data]);

  // Función para borrar archivos físicamente del servidor (Cloudinary)
  const deletePhysicalFile = async (publicId) => {
    if (!publicId) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/delete-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId })
      });
      return await response.json();
    } catch (error) {
      console.error("Error al eliminar archivo físico:", error);
    }
  };

  const handleSave = async () => {
    try {
      // Si la imagen de perfil cambió, borramos la anterior física
      if (data.imagePublicId && data.imagePublicId !== formData.imagePublicId) {
        await deletePhysicalFile(data.imagePublicId);
      }
      // Si la imagen de mail cambió, borramos la anterior física
      if (data.mailSuccessPublicId && data.mailSuccessPublicId !== formData.mailSuccessPublicId) {
        await deletePhysicalFile(data.mailSuccessPublicId);
      }

      const [tEN, sEN, dEN] = await Promise.all([
        translate(formData.title, { from: "es", to: "en" }),
        translate(formData.subtitle, { from: "es", to: "en" }),
        translate(formData.description, { from: "es", to: "en" })
      ]);
      await onUpdate({ ...formData, titleEN: tEN, subtitleEN: sEN, descriptionEN: dEN });
      setIsEditing(false);
    } catch (error) {
      await onUpdate(formData);
      setIsEditing(false);
    }
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    setIsSending(true);

    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, mailForm.current, PUBLIC_KEY)
      .then(() => {
        setMailStatus({ show: true, success: true, text: '¡MENSAJE ENVIADO!' });
        setTimeout(() => {
          setShowMailModal(false);
          setMailStatus({ show: false, success: true, text: '' });
          mailForm.current.reset();
        }, formData.mailSuccessImage ? 4000 : 2500);
      })
      .catch((err) => {
        console.error('Error:', err);
        setMailStatus({ show: true, success: false, text: 'ERROR AL ENVIAR' });
      })
      .finally(() => setIsSending(false));
  };

  const commonBtnClass = `group relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 hover:scale-110 overflow-hidden ${
    isDark ? 'bg-white/[0.03] border-white/10' : 'bg-[var(--color-light-bg-secondary)] border-slate-200'
  } hover:border-transparent`;

  const getDownloadUrl = (url) => {
    if (!url) return '';
    return url.includes('upload/') 
      ? url.replace('upload/', 'upload/fl_attachment:Mascuka_Santiago_CV/') 
      : url;
  };

  return (
    <div className={`min-h-screen relative flex items-center transition-colors duration-700 overflow-hidden pt-5 md:pt-20 ${isDark ? 'bg-[var(--color-dark-bg)]' : 'bg-[var(--color-light-bg)]'}`}>
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{backgroundImage: isDark ? 'linear-gradient(rgba(0,163,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,163,255,0.08) 1px, transparent 1px)' : 'linear-gradient(rgba(0,120,200,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,120,200,0.1) 1px, transparent 1px)', backgroundSize: '100px 100px'}} />
      
      {/* CAMBIOS: max-w más grande, gap ajustado progresivamente, mostrar imagen desde xl */}
      <div className={`w-full max-w-[1440px] mx-auto px-6 md:px-16 flex flex-col xl:flex-row items-center justify-center gap-20 xl:gap-24 2xl:gap-40 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        <div className="flex-1 z-10 text-center md:text-left space-y-8 flex flex-col items-center md:items-start">
          <div className="space-y-4">
            {/* Título: reducido en xl cuando aparece la imagen, vuelve a crecer en 2xl */}
            <h1 className={`text-5xl md:text-7xl lg:text-[110px] xl:text-8xl 2xl:text-[110px] font-black tracking-tighter whitespace-nowrap leading-none transition-all duration-700 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {lang === 'ES' ? data?.title : data?.titleEN}
            </h1>
            <div className="relative inline-block">
              <h2 className={`text-2xl md:text-3xl font-bold tracking-[0.3em] uppercase ${isDark ? 'text-[#00A3FF]' : 'text-[#0078C8]'}`}>
                {lang === 'ES' ? data?.subtitle : data?.subtitleEN}
              </h2>
              <div className={`absolute -bottom-2 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 h-[2px] bg-gradient-to-r to-transparent ${isDark ? 'from-[#00A3FF]' : 'from-[#0078C8]'}`} style={{ width: '60%' }} />
            </div>
          </div>

          <p className={`max-w-xl text-lg leading-relaxed transition-colors duration-700 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            {lang === 'ES' ? data?.description : data?.descriptionEN}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4 md:pl-[100px]">
            {data?.whatsapp && (
              <a href={data.whatsapp} target="_blank" rel="noopener noreferrer" title="WhatsApp" className={`${commonBtnClass} hover:bg-[#469642]`}>
                <svg className={`w-5 h-5 z-10 transition-all duration-300 group-hover:text-white ${isDark ? 'text-slate-400' : 'text-slate-500'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              </a>
            )}

            {data?.linkedin && (
              <a href={data.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" className={`${commonBtnClass} hover:bg-[#0077B5]`}>
                <svg className={`w-5 h-5 z-10 transition-all duration-300 group-hover:text-white ${isDark ? 'text-slate-400' : 'text-slate-500'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            )}

            {data?.email && (
              <button onClick={() => setShowMailModal(true)} title="Enviar Correo" className={commonBtnClass}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(45deg, #4285F4, #EA4335, #FBBC05, #34A853)' }} />
                <div className="absolute inset-[2px] rounded-full bg-[var(--color-light-bg-secondary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Gmail" className="w-5 h-5 z-10 transition-all duration-300 gmail-icon" style={{
                  filter: isDark ? 'brightness(0) saturate(100%) invert(71%) sepia(12%) saturate(620%) hue-rotate(180deg) brightness(90%) contrast(88%)' : 'brightness(0) saturate(100%) invert(35%) sepia(15%) saturate(850%) hue-rotate(180deg) brightness(96%) contrast(90%)'
                }} />
                <style>{`
                  .group:hover .gmail-icon {
                    filter: none !important;
                  }
                `}</style>
              </button>
            )}

            {cvUrl && (
              <a href={getDownloadUrl(cvUrl)} title="Descargar CV" className={`${commonBtnClass} hover:shadow-[0_0_25px_rgba(232,93,51,0.6)]`}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#E85D33]" />
                <div className="relative z-10 flex items-center justify-center">
                   <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
                      <path d="M4 2C4 0.895 4.895 0 6 0H14L20 6V26C20 27.104 19.104 28 18 28H6C4.895 28 4 27.104 4 26V2Z" className={`transition-colors duration-300 ${isDark ? 'fill-slate-400' : 'fill-slate-500'} group-hover:fill-white`} />
                      <text x="12" y="14" textAnchor="middle" className={`text-[7px] font-black transition-all duration-300 ${isDark ? 'fill-[#080B12]' : 'fill-[#F5F7FA]'} group-hover:fill-[#E85D33]`} style={{dominantBaseline: 'middle'}}>CV</text>
                      <rect x="8" y="19" width="8" height="1.2" className={`transition-all duration-300 ${isDark ? 'fill-[#080B12]/50' : 'fill-[#F5F7FA]/50'} group-hover:fill-[#E85D33]`} />
                      <rect x="8" y="22" width="8" height="1.2" className={`transition-all duration-300 ${isDark ? 'fill-[#080B12]/50' : 'fill-[#F5F7FA]/50'} group-hover:fill-[#E85D33]`} />
                      <path d="M14 0L20 6H14V0Z" fill="rgba(0,0,0,0.2)" />
                   </svg>
                </div>
              </a>
            )}

            {isAdmin && (
              <button 
                onClick={() => setIsEditing(true)} 
                title="Editar" 
                className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300 flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* IMAGEN CIRCULAR - Visible desde xl (1280px) */}
        <div className="hidden xl:flex flex-1 justify-center">
          <div className="relative group">
            <div className="absolute inset-0 blur-[100px] opacity-20 transition-all duration-1000 bg-[#0078C8] group-hover:opacity-40" />
            {/* Imagen circular: tamaño ajustado para xl y 2xl */}
            <div className={`relative w-[360px] h-[360px] 2xl:w-[460px] 2xl:h-[460px] rounded-full overflow-hidden border-[6px] transition-all duration-700 ${isDark ? 'border-[#0078C8]/30 shadow-2xl shadow-blue-500/10' : 'border-[#0078C8]/40 shadow-2xl shadow-slate-200'}`}>
              <img src={data?.image} alt="Profile" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE ENVÍO DE CORREO */}
      {showMailModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[600] p-4">
          {mailStatus.show && mailStatus.success && formData.mailSuccessImage ? (
            <div className="flex flex-col items-center animate-in zoom-in duration-300">
              <img 
                src={formData.mailSuccessImage} 
                alt="Success" 
                className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl shadow-2xl shadow-blue-500/20"
              />
              <button 
                onClick={() => setShowMailModal(false)}
                className="mt-6 px-8 py-3 bg-white text-black font-black uppercase text-xs rounded-full hover:scale-105 transition-transform"
              >
                CERRAR
              </button>
            </div>
          ) : (
            <form ref={mailForm} onSubmit={handleSendEmail} className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border ${isDark ? 'bg-[#0F172A] border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="bg-[#0078C8] p-6 flex justify-between items-center text-white font-black text-[10px] uppercase tracking-widest">
                <span>NUEVO CORREO</span>
                <button type="button" onClick={() => setShowMailModal(false)} className="hover:rotate-90 transition-transform">✕</button>
              </div>
              
              <div className="p-8 space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Para:</label>
                  <div className={`p-4 rounded-xl border text-sm font-medium ${isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-gray-100 border-slate-200 text-slate-500'}`}>
                    {formData.email || 'tu@correo.com'}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[#0078C8] tracking-widest">De:</label>
                  <input name="from_email" required type="email" placeholder="Ponga su correo aquí" className={`w-full p-4 rounded-xl border text-sm outline-none focus:border-[#0078C8] transition-colors ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-slate-200'}`} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[#0078C8] tracking-widest">Asunto:</label>
                  <input name="subject" required type="text" placeholder="Asunto del mensaje" className={`w-full p-4 rounded-xl border text-sm outline-none focus:border-[#0078C8] transition-colors ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-slate-200'}`} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[#0078C8] tracking-widest">Texto:</label>
                  <textarea name="message" required placeholder="Escriba su mensaje aquí..." className={`w-full p-4 rounded-xl border text-sm outline-none focus:border-[#0078C8] h-32 resize-none transition-colors ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-slate-200'}`} />
                </div>
                
                {mailStatus.show && (
                  <div className={`p-4 rounded-xl text-[10px] font-bold text-center uppercase tracking-widest animate-pulse ${
                    mailStatus.success 
                      ? isDark 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-green-500/20 text-green-700 border-2 border-green-500/30'
                      : isDark
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-red-500/20 text-red-700 border-2 border-red-500/30'
                  }`}>
                    {mailStatus.text}
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setShowMailModal(false)} className={`flex-1 py-4 border rounded-xl text-[10px] font-black tracking-widest transition-all ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>CANCELAR</button>
                  <button disabled={isSending} type="submit" className="flex-[2] py-4 bg-[#0078C8] text-white text-[10px] font-black tracking-widest rounded-xl hover:bg-[#005A96] disabled:opacity-50 transition-all">
                    {isSending ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-[#05070A]/95 backdrop-blur-xl flex items-center justify-center z-[500] p-4">
          <div className={`w-full max-w-5xl overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.6)] border ${isDark ? 'bg-[#0A0E14] border-white/10' : 'bg-white border-slate-200'}`}>
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#00A3FF]/10 to-transparent">
              <h3 className={`text-sm font-black uppercase tracking-[0.4em] ${isDark ? 'text-white' : 'text-slate-900'}`}>System Profile Editor</h3>
              <button onClick={() => setIsEditing(false)} className="group p-2 hover:bg-red-500/10 rounded-full transition-all duration-300">
                <svg className="w-5 h-5 text-slate-500 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 lg:p-12 overflow-y-auto max-h-[85vh]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#00A3FF] uppercase tracking-[0.2em]">Nombre Completo</label>
                      <input className={`w-full bg-transparent border-2 p-4 rounded-xl outline-none ${isDark ? 'border-white/5 text-white focus:border-[#00A3FF]/50' : 'border-slate-100 text-slate-900 focus:border-[#0078C8]/50'}`} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#00A3FF] uppercase tracking-[0.2em]">Especialidad</label>
                      <input className={`w-full bg-transparent border-2 p-4 rounded-xl outline-none ${isDark ? 'border-white/5 text-white focus:border-[#00A3FF]/50' : 'border-slate-100 text-slate-900 focus:border-[#0078C8]/50'}`} value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#00A3FF] uppercase tracking-[0.2em]">Descripción</label>
                    <textarea className={`w-full bg-transparent border-2 p-5 outline-none h-40 resize-none rounded-2xl ${isDark ? 'border-white/5 text-white focus:border-[#00A3FF]/50' : 'border-slate-100 text-slate-900 focus:border-[#0078C8]/50'}`} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-green-500 uppercase tracking-widest">WhatsApp URL</label>
                      <input className={`w-full bg-transparent border-b p-2 text-xs outline-none ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`} value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} placeholder="https://wa.me/..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest">LinkedIn URL</label>
                      <input className={`w-full bg-transparent border-b p-2 text-xs outline-none ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`} value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-red-500 uppercase tracking-widest">Email</label>
                      <input className={`w-full bg-transparent border-b p-2 text-xs outline-none ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="tu@email.com" />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-8">
                  <ImageUploader currentImage={formData.image} onImageChange={(url, id) => setFormData(p => ({...p, image: url, imagePublicId: id}))} isDark={isDark} />
                  
                  <div className="space-y-3 p-4 rounded-2xl border border-dashed border-white/10">
                    <label className="text-[10px] font-black text-[#00A3FF] uppercase tracking-[0.2em] flex justify-between items-center">
                      Imagen Éxito Correo
                      {formData.mailSuccessImage && (
                        <button 
                          onClick={() => setFormData(p => ({...p, mailSuccessImage: '', mailSuccessPublicId: ''}))}
                          className="text-red-500 hover:text-red-400 lowercase font-normal text-[9px] tracking-normal"
                        >
                          [ eliminar ]
                        </button>
                      )}
                    </label>
                    <ImageUploader 
                      currentImage={formData.mailSuccessImage} 
                      onImageChange={(url, id) => setFormData(p => ({...p, mailSuccessImage: url, mailSuccessPublicId: id}))} 
                      isDark={isDark} 
                    />
                  </div>

                  <CVUploader currentCV={cvUrl} onCVChange={(url, id) => {
                    onUpdateCV(url, id);
                    setFormData(p => ({...p, cvPublicId: id}));
                  }} isDark={isDark} />
                  
                  <button onClick={handleSave} className="relative w-full group overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0078C8] to-[#005A96]" />
                    <div className="relative py-5 flex items-center justify-center gap-3 text-white font-black uppercase tracking-[0.4em] text-[10px]">GUARDAR CAMBIOS</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}