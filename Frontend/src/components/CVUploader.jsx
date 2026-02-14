import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CLOUDINARY_CONFIG } from '../constants/config';

/**
 * CV UPLOADER REUTILIZABLE
 * Componente para subir archivos PDF (CV) a Cloudinary
 */
export default function CVUploader({ currentCV, onCVChange }) {
  const { isDark } = useApp();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    
    // Validar que sea PDF
    if (!file || file.type !== 'application/pdf') {
      alert("Por favor, selecciona un archivo PDF válido.");
      return;
    }

    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', CLOUDINARY_CONFIG.folders.cv); 
    formData.append('public_id', 'cv_santimascuka'); // Sobrescribe el archivo anterior

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/raw/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      const data = await res.json();
      
      if (data.secure_url) {
        // Agregar timestamp para evitar cache
        const freshUrl = `${data.secure_url}?v=${new Date().getTime()}`;
        onCVChange(freshUrl, data.public_id);
        alert("¡CV actualizado correctamente! No olvides guardar los cambios.");
      } else {
        alert("Error al subir el archivo.");
      }
    } catch (err) {
      console.error('Error:', err);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className={`
        group flex items-center gap-4 p-3 rounded-2xl border-2 border-dashed 
        transition-all cursor-pointer
        ${isDark 
          ? 'border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-[#00A3FF]/50' 
          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-[#00A3FF]/50'
        }
      `}>
        <input 
          type="file" 
          className="hidden" 
          onChange={handleFile} 
          accept=".pdf"
          disabled={uploading}
        />
        
        {/* Ícono PDF */}
        <div className={`
          w-14 h-14 flex items-center justify-center rounded-xl transition-colors
          ${isDark ? 'bg-white/5 text-[#00A3FF]' : 'bg-slate-200 text-[#00A3FF]'} 
          group-hover:bg-[#00A3FF] group-hover:text-white
        `}>
          {uploading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        {/* Texto */}
        <div className="flex-1">
          <h4 className={`
            text-[11px] font-black uppercase tracking-[0.2em] mb-0.5
            ${isDark ? 'text-white' : 'text-slate-900'}
          `}>
            Documento CV
          </h4>
          <p className="text-[10px] text-[#00A3FF] font-bold">
            {uploading 
              ? 'Actualizando archivo...' 
              : currentCV 
                ? 'PDF Cargado - Click para reemplazar' 
                : 'Sin archivo - Click para subir'
            }
          </p>
        </div>
      </label>
    </div>
  );
}