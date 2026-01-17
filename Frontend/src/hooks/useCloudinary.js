import { useState } from 'react';

export const useCloudinary = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file, folder = 'portfolio') => {
    setUploading(true);
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Nueva función para eliminar imágenes
  const deleteImage = async (publicId) => {
    try {
      // Por ahora solo registramos en consola
      // Para eliminar realmente necesitas Firebase Functions con el API Secret
      console.log('🗑️ Imagen marcada para eliminar:', publicId);
      
      // TODO: Implementar con Firebase Functions cuando esté listo
      // const deleteFunction = httpsCallable(functions, 'deleteCloudinaryImage');
      // const result = await deleteFunction({ publicId });
      // return result.data;
      
      return { success: true, message: 'Registrado para eliminar' };
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      return { success: false, error: error.message };
    }
  };

  return { uploadImage, deleteImage, uploading };
};