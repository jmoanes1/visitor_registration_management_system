import api from './api.js';

export const visitorService = {
  getAll: (params) => api.get('/visitors', { params }),
  getById: (id) => api.get(`/visitors/${id}`),
  create: (data) => api.post('/visitors', data),
  update: (id, data) => api.patch(`/visitors/${id}`, data),
  checkIn: (id) => api.post(`/visitors/${id}/check-in`),
  checkOut: (id) => api.post(`/visitors/${id}/check-out`),
  cancel: (id) => api.post(`/visitors/${id}/cancel`),
  delete: (id) => api.delete(`/visitors/${id}`),
};
