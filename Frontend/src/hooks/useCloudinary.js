import { useState } from 'react';

export const useCloudinary = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file, folder = 'portfolio', onProgress = null) => {
    setUploading(true);
    
    return new Promise((resolve, reject) => {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);

      // Detectar si es video o imagen
      const isVideo = file.type.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';

      const xhr = new XMLHttpRequest();
      
      // Evento de progreso de subida
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          onProgress(percentComplete);
        }
      });

      // Cuando termina la subida
      xhr.addEventListener('load', () => {
        setUploading(false);
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            
            // Verificar que la respuesta sea válida
            if (!data.secure_url || !data.public_id) {
              reject(new Error('Respuesta inválida de Cloudinary'));
            } else {
              resolve(data);
            }
          } catch (error) {
            reject(new Error('Error parseando respuesta de Cloudinary'));
          }
        } else {
          reject(new Error(`Error ${xhr.status}: ${xhr.statusText}`));
        }
      });

      // Error de red
      xhr.addEventListener('error', () => {
        setUploading(false);
        reject(new Error('Error de red al subir archivo'));
      });

      // Timeout
      xhr.addEventListener('timeout', () => {
        setUploading(false);
        reject(new Error('Timeout al subir archivo'));
      });

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);
      xhr.send(formData);
    });
  };

  // Función para eliminar imágenes/videos
  const deleteImage = async (publicId) => {
    try {
      console.log('🗑️ Eliminando de Cloudinary:', publicId);
      
      // Usar el mismo endpoint que tienes en tu proyecto
      const response = await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId })
      });
      
      const result = await response.json();
      console.log('✅ Resultado eliminación:', result);
      return result;
    } catch (error) {
      console.error('❌ Error al eliminar archivo:', error);
      return { success: false, error: error.message };
    }
  };

  return { uploadImage, deleteImage, uploading };
};