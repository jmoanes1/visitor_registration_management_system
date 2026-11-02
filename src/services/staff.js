import api from './api.js';

export const staffApi = {
  list: () => api.get('/staff'),
  create: (data) => api.post('/staff', data),
  toggleActive: (id) => api.patch(`/staff/${id}/toggle`),
};
