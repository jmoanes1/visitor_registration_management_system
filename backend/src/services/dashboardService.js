import { visitors } from '../data/mockVisitors.js';

const getSummary = () => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const todayVisitors = visitors.filter(
    (v) => v.registrationTimestamp.startsWith(today)
  );

  const checkedIn = visitors.filter((v) => v.status === 'Checked In');
  const checkedOutToday = visitors.filter(
    (v) => v.status === 'Checked Out' && v.checkOutTime && v.checkOutTime.startsWith(today)
  );

  const expected = visitors.filter((v) => v.status === 'Expected');

  return {
    totalVisitorsToday: todayVisitors.length,
    currentlyCheckedIn: checkedIn.length,
    completedVisitsToday: checkedOutToday.length,
    expectedVisitors: expected.length,
  };
};

const getActivity = () => {
  const activity = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayVisitors = visitors.filter(
      (v) => v.registrationTimestamp.startsWith(dateStr)
    );

    activity.push({
      date: dateStr,
      count: dayVisitors.length,
    });
  }

  return activity;
};

export { getSummary, getActivity };
