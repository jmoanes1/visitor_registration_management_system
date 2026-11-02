import api from './api.js';

export const reportsApi = {
  visitors: (params) => api.get('/reports/visitors', { params }),
};
