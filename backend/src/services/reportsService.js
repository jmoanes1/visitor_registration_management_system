import { visitors } from '../data/mockVisitors.js';

const getVisitorsReport = (filters) => {
  let results = [...visitors];

  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom).toISOString();
    results = results.filter((v) => v.registrationTimestamp >= fromDate);
  }
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo).toISOString();
    results = results.filter((v) => v.registrationTimestamp <= toDate);
  }

  const dailyTotals = {};
  const monthlyTotals = {};
  const byType = {};
  const byDepartment = {};
  let totalDuration = 0;
  let completedVisits = 0;

  results.forEach((v) => {
    const date = v.registrationTimestamp.split('T')[0];
    const month = date.substring(0, 7);

    dailyTotals[date] = (dailyTotals[date] || 0) + 1;
    monthlyTotals[month] = (monthlyTotals[month] || 0) + 1;
    byType[v.visitorType] = (byType[v.visitorType] || 0) + 1;
    byDepartment[v.department] = (byDepartment[v.department] || 0) + 1;

    if (v.checkInTime && v.checkOutTime) {
      const duration =
        (new Date(v.checkOutTime).getTime() - new Date(v.checkInTime).getTime()) /
        (1000 * 60);
      totalDuration += duration;
      completedVisits += 1;
    }
  });

  const avgDuration = completedVisits > 0 ? totalDuration / completedVisits : 0;

  return {
    total: results.length,
    dailyTotals,
    monthlyTotals,
    byType,
    byDepartment,
    averageVisitDurationMinutes: Math.round(avgDuration * 100) / 100,
    records: results,
  };
};

export { getVisitorsReport };
