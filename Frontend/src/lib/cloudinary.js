import { Cloudinary } from '@cloudinary/url-gen';

export const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }
});

// Función para subir imagen
export const uploadImage = async (file, folder = 'portfolio') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  return await response.json();
};

// Función para eliminar imagen anterior
export const deleteImage = async (publicId) => {
  // Esta requiere firma del servidor por seguridad
  // Implementar con Cloud Function de Firebase
  const response = await fetch('/api/delete-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId })
  });
  return response.json();
};