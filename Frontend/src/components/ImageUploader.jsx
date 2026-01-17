import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ImageUploader({ currentImage, onImageChange, folder = 'portfolio' }) {
  const { isDark } = useApp();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);

  const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    return await response.json();
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const result = await uploadToCloudinary(file);
      onImageChange(result.secure_url, result.public_id);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className={`group relative flex items-center gap-4 p-3 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
        isDark 
        ? 'border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-[#00A3FF]/50' 
        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-[#00A3FF]/50'
      }`}>
        <input type="file" className="hidden" onChange={handleFile} accept="image/*" />
        
        <div className="relative w-14 h-14 flex-shrink-0">
          <div className={`absolute inset-0 rounded-full border-2 border-[#00A3FF] opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500`} />
          <img 
            src={preview || "/placeholder-user.png"} 
            className="w-full h-full object-cover rounded-full p-1"
            alt="Preview"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {uploading ? 'Procesando...' : 'Imagen de Perfil'}
          </h4>
          <p className="text-[10px] text-[#00A3FF] font-bold">Pulse para {currentImage ? 'actualizar' : 'subir'}</p>
        </div>

        <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5 text-white/40' : 'bg-slate-200 text-slate-500'} group-hover:text-[#00A3FF] transition-colors`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
      </label>
    </div>
  );
}