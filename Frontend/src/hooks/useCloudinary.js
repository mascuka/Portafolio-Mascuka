import { useState } from 'react';
import { uploadToCloudinary, deleteFromCloudinary } from '../lib/cloudinary';

/**
 * HOOK PARA CLOUDINARY
 * Maneja el estado de subida/eliminación de archivos
 */

export const useCloudinary = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * Sube una imagen o video a Cloudinary
   * @param {File} file - Archivo a subir
   * @param {string} folder - Carpeta destino
   * @returns {Promise} Datos del archivo subido
   */
  const uploadImage = async (file, folder = 'portfolio') => {
    setUploading(true);
    setProgress(0);
    
    try {
      return await uploadToCloudinary(file, folder, (percent) => {
        setProgress(percent);
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  /**
   * Elimina un archivo de Cloudinary
   * @param {string} publicId - ID del archivo a eliminar
   * @returns {Promise} Resultado de la eliminación
   */
  const deleteImage = async (publicId) => {
    return deleteFromCloudinary(publicId);
  };

  return { 
    uploadImage, 
    deleteImage, 
    uploading, 
    progress 
  };
};