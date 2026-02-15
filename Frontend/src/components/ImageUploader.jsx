import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useCloudinary } from '../hooks/useCloudinary';

/**
 * IMAGE UPLOADER REUTILIZABLE
 * Componente para subir imágenes a Cloudinary con preview
 */
export default function ImageUploader({ 
  currentImage, 
  onImageChange, 
  folder = 'portfolio',
  label = 'Imagen de Perfil'
}) {
  const { isDark } = useApp();
  const { uploadImage, uploading, progress } = useCloudinary();
  const [preview, setPreview] = useState(currentImage);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith('image/')) return;

    // Preview local inmediato
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Subir a Cloudinary
    try {
      const result = await uploadImage(file, folder);
      onImageChange(result.secure_url, result.public_id);
    } catch (error) {
      console.error('Error al subir imagen:', error);
      alert(error.message || 'Error al subir la imagen');
    }
  };

  return (
    <div className="w-full">
      <label className={`
        group relative flex items-center gap-4 p-3 rounded-2xl border-2 border-dashed 
        transition-all cursor-pointer overflow-hidden
        ${isDark 
          ? 'border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-[#00A3FF]/50' 
          : 'border-slate-200 bg-[var(--color-light-bg-secondary)] hover:bg-[var(--color-light-bg)] hover:border-[#00A3FF]/50'
        }
      `}>
        <input 
          type="file" 
          className="hidden" 
          onChange={handleFile} 
          accept="image/*"
          disabled={uploading}
        />
        
        {/* Preview circular */}
        <div className="relative w-14 h-14 flex-shrink-0">
          <div className="absolute inset-0 rounded-full border-2 border-[#00A3FF] opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
          <img 
            src={preview || "/placeholder-user.png"} 
            className="w-full h-full object-cover rounded-full p-1"
            alt="Preview"
          />
          
          {/* Spinner de carga */}
          {uploading && (
            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Texto */}
        <div className="flex-1">
          <h4 className={`
            text-[11px] font-black uppercase tracking-[0.2em] mb-0.5
            ${isDark ? 'text-white' : 'text-slate-900'}
          `}>
            {uploading ? `Subiendo... ${progress}%` : label}
          </h4>
          <p className="text-[10px] text-[#00A3FF] font-bold">
            {uploading ? 'Procesando imagen' : `Pulse para ${currentImage ? 'actualizar' : 'subir'}`}
          </p>
        </div>

        {/* Ícono upload */}
        <div className={`
          p-2 rounded-lg transition-colors
          ${isDark ? 'bg-white/5 text-white/40' : 'bg-[var(--color-light-bg)] text-slate-500'} 
          group-hover:text-[#00A3FF]
        `}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
      </label>
    </div>
  );
}