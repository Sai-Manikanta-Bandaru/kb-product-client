import api from './api';

export const getScreens = async () => {
  const response = await api.get('/screens');
  return response.data;
};

export const getScreen = async (id) => {
  const response = await api.get(`/screens/${id}`);
  return response.data;
};

export const createScreen = async (data) => {
  const response = await api.post('/screens', data);
  return response.data;
};

export const updateScreen = async (id, data) => {
  const response = await api.put(`/screens/${id}`, data);
  return response.data;
};

export const deleteScreen = async (id) => {
  const response = await api.delete(`/screens/${id}`);
  return response.data;
};
