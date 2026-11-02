import { list } from './visitors.js';

const today = () => new Date().toISOString().slice(0, 10);

const summary = () => {
  const visitors = list();
  const currentDay = today();

  return {
    totalVisitorsToday: visitors.filter((visitor) =>
      visitor.registrationTimestamp.startsWith(currentDay)
    ).length,
    currentlyCheckedIn: visitors.filter((visitor) => visitor.status === 'Checked In').length,
    completedVisitsToday: visitors.filter(
      (visitor) =>
        visitor.status === 'Checked Out' && visitor.checkOutTime?.startsWith(currentDay)
    ).length,
    expectedVisitors: visitors.filter((visitor) => visitor.status === 'Expected').length,
  };
};

// Registrations per day for the last seven days, oldest first.
const activity = () => {
  const visitors = list();

  return Array.from({ length: 7 }, (_, position) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - position));
    const day = date.toISOString().slice(0, 10);

    return {
      date: day,
      count: visitors.filter((visitor) => visitor.registrationTimestamp.startsWith(day)).length,
    };
  });
};

export { summary, activity };
