import api from './api.js';

export const staffService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  toggle: (id) => api.patch(`/users/${id}/toggle`),
};
