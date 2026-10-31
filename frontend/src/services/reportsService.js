import api from './api.js';

export const reportsService = {
  getVisitorsReport: (params) => api.get('/reports/visitors', { params }),
};
