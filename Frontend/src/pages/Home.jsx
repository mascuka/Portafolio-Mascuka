import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import translate from 'translate';
import emailjs from '@emailjs/browser';
import ImageUploader from '../components/ImageUploader';
import CVUploader from '../components/CVUploader';

export default function Home({ data, cvUrl, onUpdate, onUpdateCV }) {
  const { isDark, lang, isAdmin } = useApp(); // ✅ Usar el contexto
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    subtitle: '', 
    description: '', 
    image: '', 
    imagePublicId: '',
    email: '', 
    whatsapp: '',
    linkedin: ''
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
        title: data.title || '', 
        subtitle: data.subtitle || '', 
        description: data.description || '', 
        image: data.image || '',
        imagePublicId: data.imagePublicId || '',
        whatsapp: data.whatsapp || '',
        linkedin: data.linkedin || '',
        email: data.email || ''
      });
    }
  }, [data]);

  const handleSave = async () => {
    try {
      const [tEN, sEN, dEN] = await Promise.all([
        translate(formData.title, { from: "es", to: "en" }),
        translate(formData.subtitle, { from: "es", to: "en" }),
        translate(formData.description, { from: "es", to: "en" })
      ]);
      await onUpdate({ 
        ...formData, 
        titleEN: tEN, 
        subtitleEN: sEN, 
        descriptionEN: dEN
      });
      setIsEditing(false);
    } catch (error) {
      await onUpdate(formData);
      setIsEditing(false);
    }
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    setIsSending(true);
    emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', mailForm.current, 'YOUR_PUBLIC_KEY')
      .then(() => {
        setMailStatus({ show: true, success: true, text: '¡Correo enviado con éxito!' });
        setTimeout(() => {
          setShowMailModal(false);
          setMailStatus({ show: false, success: true, text: '' });
        }, 3000);
      })
      .catch((error) => {
        console.error('EmailJS Error:', error);
        setMailStatus({ show: true, success: false, text: 'Error al enviar el mensaje' });
      })
      .finally(() => setIsSending(false));
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      url: data?.whatsapp,
      show: !!data?.whatsapp,
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>,
      color: 'hover:bg-[#25D366]'
    },
    {
      name: 'LinkedIn',
      url: data?.linkedin,
      show: !!data?.linkedin,
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
      color: 'hover:bg-[#0077B5]'
    },
    {
      name: 'Email',
      show: !!data?.email,
      onClick: () => setShowMailModal(true),
      tooltip: data?.email,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      color: 'hover:bg-[#4285F4]'
    }
  ];

  return (
    <div className={`min-h-screen relative flex items-center transition-colors duration-700 overflow-hidden ${isDark ? 'bg-[#080B12]' : 'bg-[#F5F7FA]'}`}>
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{backgroundImage: isDark ? 'linear-gradient(rgba(0,163,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,163,255,0.08) 1px, transparent 1px)' : 'linear-gradient(rgba(0,120,200,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,120,200,0.1) 1px, transparent 1px)', backgroundSize: '100px 100px'}} />
      <div className="absolute inset-0 pointer-events-none" style={{background: isDark ? 'radial-gradient(circle at 30% 40%, rgba(0, 163, 255, 0.04) 0%, transparent 50%)' : 'radial-gradient(circle at 30% 40%, rgba(0, 120, 200, 0.1) 0%, transparent 50%)'}} />
      
      <div className={`w-full max-w-[1440px] mx-auto px-6 md:px-16 flex flex-col lg:flex-row items-center justify-center gap-20 lg:gap-40 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex-1 z-10 text-left space-y-8">
          <div className="space-y-4">
            <h1 className={`text-5xl md:text-7xl lg:text-[110px] font-black tracking-tighter whitespace-nowrap leading-none transition-all duration-700 ${isDark ? 'text-white' : 'text-slate-900'}`} style={{textShadow: isDark ? '0 0 80px rgba(0, 163, 255, 0.12)' : 'none'}}>
              {lang === 'ES' ? data?.title : data?.titleEN}
            </h1>
            <div className="relative inline-block">
              <h2 className={`text-2xl md:text-3xl font-bold tracking-[0.3em] uppercase ${isDark ? 'text-[#00A3FF]' : 'text-[#0078C8]'}`}>
                {lang === 'ES' ? data?.subtitle : data?.subtitleEN}
              </h2>
              <div className={`absolute -bottom-2 left-0 h-[2px] bg-gradient-to-r to-transparent ${isDark ? 'from-[#00A3FF]' : 'from-[#0078C8]'}`} style={{ width: '60%' }} />
            </div>
          </div>

          <p className={`max-w-xl text-lg leading-relaxed transition-colors duration-700 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            {lang === 'ES' ? data?.description : data?.descriptionEN}
          </p>

          <div className="flex flex-wrap items-center gap-8 pt-4">
            {cvUrl && (
              <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="group relative px-9 py-3.5 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 hover:-translate-y-0.5 rounded-lg border bg-[#0078C8] text-white border-[#0078C8] hover:bg-[#005A96] shadow-md shadow-[#0078C8]/20">
                {lang === 'ES' ? 'Descargar CV' : 'Download CV'}
              </a>
            )}

            <div className="flex items-center gap-4">
              {socialLinks.filter(link => link.show).map((social) => (
                <a
                  key={social.name}
                  href={social.url || '#'}
                  onClick={social.onClick}
                  target={social.url ? "_blank" : undefined}
                  rel={social.url ? "noopener noreferrer" : undefined}
                  title={social.tooltip}
                  className={`cursor-pointer flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 hover:scale-110 hover:text-white ${
                    isDark 
                      ? 'bg-white/[0.03] border-white/10 text-white/40 hover:border-transparent' 
                      : 'bg-white border-slate-200 text-slate-400 hover:border-transparent'
                  } ${social.color}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {isAdmin && (
              <button onClick={() => setIsEditing(true)} className={`w-11 h-11 flex items-center justify-center border transition-all duration-300 hover:scale-105 rounded-lg ${isDark ? 'border-white/10 text-white/20 hover:border-[#00A3FF]/40 hover:text-[#00A3FF]' : 'border-slate-300 text-slate-400 hover:border-[#0078C8]/40 hover:text-[#0078C8]'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 blur-[100px] opacity-20 transition-all duration-1000 bg-[#0078C8] group-hover:opacity-40" />
            <div className={`relative w-72 h-72 md:w-[460px] md:h-[460px] rounded-full overflow-hidden border-[6px] transition-all duration-700 ${isDark ? 'border-[#0078C8]/30 shadow-2xl shadow-blue-500/10' : 'border-[#0078C8]/10 shadow-2xl shadow-slate-200'}`}>
              <img src={data?.image} alt="Profile" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            </div>
          </div>
        </div>
      </div>

      {showMailModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[600] p-4">
          <form ref={mailForm} onSubmit={handleSendEmail} className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border ${isDark ? 'bg-[#0F172A] border-white/10' : 'bg-white border-slate-200'}`}>
            <div className="bg-[#0078C8] p-6 flex justify-between items-center text-white font-black text-xs uppercase tracking-widest">
              <span>Enviar Correo</span>
              <button type="button" onClick={() => setShowMailModal(false)}>✕</button>
            </div>
            <div className="p-8 space-y-4">
              <input type="hidden" name="to_email" value={formData.email} />
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Tu Email</label>
                <input name="user_email" required type="email" className={`w-full p-4 rounded-xl border text-sm outline-none focus:border-[#0078C8] ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50'}`} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Mensaje</label>
                <textarea name="message" required className={`w-full p-4 rounded-xl border text-sm outline-none focus:border-[#0078C8] h-32 resize-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50'}`} />
              </div>
              {mailStatus.show && (
                <div className={`p-4 rounded-xl text-[10px] font-bold text-center uppercase tracking-widest ${mailStatus.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {mailStatus.text}
                </div>
              )}
              <button disabled={isSending} type="submit" className="w-full py-4 bg-[#0078C8] text-white text-[10px] font-black tracking-widest rounded-xl hover:bg-[#005A96] transition-all">
                {isSending ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}
              </button>
            </div>
          </form>
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
                  <CVUploader currentCV={cvUrl} onCVChange={onUpdateCV} isDark={isDark} />
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