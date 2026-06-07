import api from './api';

export const getScreenContents = async (screenId) => {
  const response = await api.get(`/screens/${screenId}/contents`);
  return response.data;
};

export const uploadContent = async (formData) => {
  const response = await api.post('/contents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const activateContent = async (contentId) => {
  const response = await api.put(`/contents/${contentId}/activate`, { isActive: true });
  return response.data;
};

export const deleteContent = async (contentId) => {
  const response = await api.delete(`/contents/${contentId}`);
  return response.data;
};
