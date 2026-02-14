import { Cloudinary } from '@cloudinary/url-gen';
import { CLOUDINARY_CONFIG } from '../constants/config';

/**
 * CLOUDINARY - CONFIGURACIÓN Y UTILIDADES
 * Todas las funciones de Cloudinary centralizadas aquí
 */

// Instancia de Cloudinary para transformaciones
export const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUDINARY_CONFIG.cloudName
  }
});

/**
 * Sube un archivo a Cloudinary (imagen o video)
 * @param {File} file - Archivo a subir
 * @param {string} folder - Carpeta destino en Cloudinary
 * @param {Function} onProgress - Callback de progreso (opcional)
 * @returns {Promise} Objeto con secure_url y public_id
 */
export const uploadToCloudinary = (file, folder = CLOUDINARY_CONFIG.folders.portfolio, onProgress = null) => {
  return new Promise((resolve, reject) => {
    // Validar tamaño
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? CLOUDINARY_CONFIG.limits.maxVideoSize : CLOUDINARY_CONFIG.limits.maxImageSize;
    
    if (file.size > maxSize) {
      reject(new Error(`El archivo excede el tamaño máximo de ${maxSize / 1024 / 1024}MB`));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', folder);

    const resourceType = isVideo ? 'video' : 'image';
    const xhr = new XMLHttpRequest();
    
    // Progreso de subida
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          onProgress(percentComplete);
        }
      });
    }

    // Success
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.secure_url && data.public_id) {
            resolve(data);
          } else {
            reject(new Error('Respuesta inválida de Cloudinary'));
          }
        } catch (error) {
          reject(new Error('Error parseando respuesta de Cloudinary'));
        }
      } else {
        reject(new Error(`Error ${xhr.status}: ${xhr.statusText}`));
      }
    });

    // Errores
    xhr.addEventListener('error', () => reject(new Error('Error de red al subir archivo')));
    xhr.addEventListener('timeout', () => reject(new Error('Timeout al subir archivo')));

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`);
    xhr.send(formData);
  });
};

/**
 * Elimina un archivo de Cloudinary
 * @param {string} publicId - ID público del archivo a eliminar
 * @returns {Promise} Resultado de la eliminación
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await fetch('/api/delete-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Genera una URL optimizada para una imagen
 * @param {string} publicId - ID público de la imagen
 * @param {Object} options - Opciones de transformación
 * @returns {string} URL optimizada
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 800,
    quality = 'auto',
    format = 'auto',
  } = options;

  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/w_${width},q_${quality},f_${format}/${publicId}`;
};