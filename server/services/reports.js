import { list } from './visitors.js';

const minutesBetween = (from, to) => (new Date(to) - new Date(from)) / 60000;

const tallyBy = (visitors, getKey) =>
  visitors.reduce((tally, visitor) => {
    const key = getKey(visitor);
    tally[key] = (tally[key] || 0) + 1;
    return tally;
  }, {});

const report = (filters = {}) => {
  const visitors = list(filters);

  const timedVisits = visitors.filter((visitor) => visitor.checkInTime && visitor.checkOutTime);
  const averageVisitDurationMinutes = timedVisits.length
    ? Math.round(
        (timedVisits.reduce(
          (total, visitor) => total + minutesBetween(visitor.checkInTime, visitor.checkOutTime),
          0
        ) /
          timedVisits.length) *
          100
      ) / 100
    : 0;

  return {
    total: visitors.length,
    byType: tallyBy(visitors, (visitor) => visitor.visitorType),
    byDepartment: tallyBy(visitors, (visitor) => visitor.department),
    averageVisitDurationMinutes,
    records: visitors,
  };
};

export { report };
