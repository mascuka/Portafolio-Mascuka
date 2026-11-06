import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/useApp';
import translate from 'translate';
import emailjs from '@emailjs/browser';
import { IconBrandWhatsapp, IconBrandLinkedin, IconMail, IconFileCv } from '@tabler/icons-react';
import ImageUploader from '../components/ImageUploader';
import CVUploader from '../components/CVUploader';

export default function Home({ data, cvUrl, onUpdate, onUpdateCV }) {
  const { isDark, lang, isAdmin } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', subtitle: '', description: '', image: '', imagePublicId: '',
    imageLight: '', imageLightPublicId: '',
    email: '', whatsapp: '', linkedin: '', cvPublicId: '',
    mailSuccessImage: '', mailSuccessPublicId: ''
  });
  // Qué foto de perfil se está editando: `image` es la del modo oscuro e
  // `imageLight` la del claro (si falta, el claro usa la del oscuro)
  const [fotoModo, setFotoModo] = useState('oscuro');
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
        imageLight: data.imageLight || '', imageLightPublicId: data.imageLightPublicId || '',
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
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      console.warn('No se pudo borrar el archivo: configura VITE_API_URL para habilitar el endpoint.');
      return;
    }

    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/delete-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId })
      });
      if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error al eliminar archivo físico:", error);
    }
  };

  const handleSave = async () => {
    if (data?.imagePublicId && data.imagePublicId !== formData.imagePublicId) {
      await deletePhysicalFile(data.imagePublicId);
    }
    if (data?.imageLightPublicId && data.imageLightPublicId !== formData.imageLightPublicId) {
      await deletePhysicalFile(data.imageLightPublicId);
    }
    if (data?.mailSuccessPublicId && data.mailSuccessPublicId !== formData.mailSuccessPublicId) {
      await deletePhysicalFile(data.mailSuccessPublicId);
    }

    let translatedFields = {};
    try {
      const [titleEN, subtitleEN, descriptionEN] = await Promise.all([
        translate(formData.title, { from: "es", to: "en" }),
        translate(formData.subtitle, { from: "es", to: "en" }),
        translate(formData.description, { from: "es", to: "en" })
      ]);
      translatedFields = { titleEN, subtitleEN, descriptionEN };
    } catch (error) {
      console.warn('No se pudieron traducir los textos; se guardarán sin traducción.', error);
    }

    try {
      await onUpdate({ ...formData, ...translatedFields });
      setIsEditing(false);
    } catch (error) {
      console.error('Error guardando el contenido:', error);
      window.alert('No se pudieron guardar los cambios. Revisa la conexión y vuelve a intentarlo.');
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

  // Círculos de contacto: colores, tamaño y hover viven en .claro-social (index.css)
  const commonBtnClass = 'claro-social relative flex items-center justify-center w-12 h-12 rounded-full border';

  const getDownloadUrl = (url) => {
    if (!url) return '';
    return url.includes('upload/') 
      ? url.replace('upload/', 'upload/fl_attachment:Mascuka_Santiago_CV/') 
      : url;
  };

  return (
    <div className={`claro-hero min-h-screen relative flex items-center transition-colors duration-700 overflow-hidden pt-5 md:pt-20 ${isDark ? 'bg-[var(--color-dark-bg)]' : 'bg-[var(--color-light-bg)]'}`}>
      
      {/* CAMBIOS: max-w más grande, gap ajustado progresivamente, mostrar imagen desde xl */}
      <div className={`claro-contenedor claro-hero-fila w-full max-w-[1440px] mx-auto px-6 md:px-16 flex flex-col xl:flex-row items-center justify-center gap-20 xl:gap-24 2xl:gap-40 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        <div className="claro-hero-col flex-1 z-10 text-center md:text-left space-y-8 flex flex-col items-center md:items-start">
          <div className="space-y-4">
            {/* Título: reducido en xl cuando aparece la imagen, vuelve a crecer en 2xl */}
            <h1 className={`text-5xl md:text-7xl lg:text-[110px] xl:text-8xl 2xl:text-[110px] claro-hero-titulo font-black tracking-tighter whitespace-nowrap leading-none transition-all duration-700 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {lang === 'ES' ? data?.title : data?.titleEN}
            </h1>
            <div className="relative inline-block">
              <h2 className={`claro-rol text-2xl md:text-3xl font-bold tracking-[0.3em] uppercase ${isDark ? 'text-acento-light' : 'text-acento'}`}>
                {lang === 'ES' ? data?.subtitle : data?.subtitleEN}
              </h2>
              <div className={`claro-oculto absolute -bottom-2 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 h-[2px] bg-gradient-to-r to-transparent ${isDark ? 'from-acento-light' : 'from-acento'}`} style={{ width: '60%' }} />
            </div>
          </div>

          <p className={`claro-hero-texto max-w-xl text-lg leading-relaxed transition-colors duration-700 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            {lang === 'ES' ? data?.description : data?.descriptionEN}
          </p>

          <div className="claro-redes flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4 md:pl-[100px]">
            {data?.whatsapp && (
              <a href={data.whatsapp} target="_blank" rel="noopener noreferrer" title="WhatsApp" className={commonBtnClass}>
                <IconBrandWhatsapp size={20} stroke={1.5} aria-hidden="true" />
              </a>
            )}

            {data?.linkedin && (
              <a href={data.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" className={commonBtnClass}>
                <IconBrandLinkedin size={20} stroke={1.5} aria-hidden="true" />
              </a>
            )}

            {data?.email && (
              <button onClick={() => setShowMailModal(true)} title="Enviar Correo" className={commonBtnClass}>
                <IconMail size={20} stroke={1.5} aria-hidden="true" />
              </button>
            )}

            {cvUrl && (
              <a href={getDownloadUrl(cvUrl)} title="Descargar CV" className={commonBtnClass}>
                <IconFileCv size={20} stroke={1.5} aria-hidden="true" />
              </a>
            )}

            {isAdmin && (
              <button 
                onClick={() => { setFotoModo(isDark ? 'oscuro' : 'claro'); setIsEditing(true); }}
                title="Editar" 
                className="claro-btn-suave w-12 h-12 rounded-full bg-acento/10 text-acento hover:bg-acento hover:text-white transition-all duration-300 flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* IMAGEN CIRCULAR - Visible desde xl (1280px) */}
        <div className="claro-foto-col hidden xl:flex flex-1 justify-center">
          <div className="relative group">
            <div className="claro-oculto absolute inset-0 blur-[100px] opacity-20 transition-all duration-1000 bg-acento group-hover:opacity-40" />
            {/* Imagen circular: tamaño ajustado para xl y 2xl */}
            <div className={`claro-foto relative w-[360px] h-[360px] 2xl:w-[460px] 2xl:h-[460px] rounded-full overflow-hidden border-[6px] transition-all duration-700 ${isDark ? 'border-acento/30 shadow-2xl shadow-blue-500/10' : 'border-acento/25 shadow-suave-hover'}`}>
              <img src={isDark ? data?.image : (data?.imageLight || data?.image)} alt="Profile" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
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
              <div className="bg-acento p-6 flex justify-between items-center text-white font-black text-[10px] uppercase tracking-widest">
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
                  <label className="text-[10px] font-black uppercase text-acento tracking-widest">De:</label>
                  <input name="from_email" required type="email" placeholder="Ponga su correo aquí" className={`w-full p-4 rounded-xl border text-sm outline-none focus:border-acento transition-colors ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-slate-200'}`} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-acento tracking-widest">Asunto:</label>
                  <input name="subject" required type="text" placeholder="Asunto del mensaje" className={`w-full p-4 rounded-xl border text-sm outline-none focus:border-acento transition-colors ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-slate-200'}`} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-acento tracking-widest">Texto:</label>
                  <textarea name="message" required placeholder="Escriba su mensaje aquí..." className={`w-full p-4 rounded-xl border text-sm outline-none focus:border-acento h-32 resize-none transition-colors ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-slate-200'}`} />
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
                  <button disabled={isSending} type="submit" className="flex-[2] py-4 bg-acento text-white text-[10px] font-black tracking-widest rounded-xl hover:bg-acento-hover disabled:opacity-50 transition-all">
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
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-acento-light/10 to-transparent">
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
                      <label className="text-[10px] font-black text-acento-light uppercase tracking-[0.2em]">Nombre Completo</label>
                      <input className={`w-full bg-transparent border-2 p-4 rounded-xl outline-none ${isDark ? 'border-white/5 text-white focus:border-acento-light/50' : 'border-slate-100 text-slate-900 focus:border-acento/50'}`} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-acento-light uppercase tracking-[0.2em]">Especialidad</label>
                      <input className={`w-full bg-transparent border-2 p-4 rounded-xl outline-none ${isDark ? 'border-white/5 text-white focus:border-acento-light/50' : 'border-slate-100 text-slate-900 focus:border-acento/50'}`} value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-acento-light uppercase tracking-[0.2em]">Descripción</label>
                    <textarea className={`w-full bg-transparent border-2 p-5 outline-none h-40 resize-none rounded-2xl ${isDark ? 'border-white/5 text-white focus:border-acento-light/50' : 'border-slate-100 text-slate-900 focus:border-acento/50'}`} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-green-500 uppercase tracking-widest">WhatsApp URL</label>
                      <input className={`w-full bg-transparent border-b p-2 text-xs outline-none ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`} value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} placeholder="https://wa.me/..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-acento uppercase tracking-widest">LinkedIn URL</label>
                      <input className={`w-full bg-transparent border-b p-2 text-xs outline-none ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`} value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-red-500 uppercase tracking-widest">Email</label>
                      <input className={`w-full bg-transparent border-b p-2 text-xs outline-none ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="tu@email.com" />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-8">
                  {/* Foto de perfil: una para cada tema */}
                  <div className="space-y-3">
                    <div className={`flex p-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                      {[['oscuro', 'Oscuro'], ['claro', 'Claro']].map(([modo, nombre]) => (
                        <button
                          key={modo}
                          type="button"
                          onClick={() => setFotoModo(modo)}
                          aria-pressed={fotoModo === modo}
                          className={`flex-1 py-2 rounded-full transition-all ${
                            fotoModo === modo
                              ? (isDark ? 'bg-white/10 text-white' : 'bg-white text-slate-900')
                              : (isDark ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-900')
                          }`}
                        >
                          {nombre}
                        </button>
                      ))}
                    </div>

                    {fotoModo === 'oscuro' ? (
                      <ImageUploader
                        key="foto-oscuro"
                        label="Imagen de Perfil · Modo oscuro"
                        currentImage={formData.image}
                        onImageChange={(url, id) => setFormData(p => ({...p, image: url, imagePublicId: id}))}
                      />
                    ) : (
                      <ImageUploader
                        key="foto-claro"
                        label="Imagen de Perfil · Modo claro"
                        currentImage={formData.imageLight || formData.image}
                        onImageChange={(url, id) => setFormData(p => ({...p, imageLight: url, imageLightPublicId: id}))}
                      />
                    )}

                    {fotoModo === 'claro' && (
                      formData.imageLight ? (
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({...p, imageLight: '', imageLightPublicId: ''}))}
                          className={`text-[10px] font-bold uppercase tracking-widest underline underline-offset-4 ${isDark ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          Usar la misma foto que en modo oscuro
                        </button>
                      ) : (
                        <p className={`text-[11px] ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                          Sin foto propia: el modo claro usa la del modo oscuro. Subí una para cambiarla.
                        </p>
                      )
                    )}
                  </div>
                  
                  <div className="space-y-3 p-4 rounded-2xl border border-dashed border-white/10">
                    <label className="text-[10px] font-black text-acento-light uppercase tracking-[0.2em] flex justify-between items-center">
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
                    <div className="absolute inset-0 bg-gradient-to-r from-acento to-acento-hover" />
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