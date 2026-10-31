import { getSummary, getActivity } from '../services/dashboardService.js';

const getSummaryData = (req, res) => {
  const summary = getSummary();
  res.json({ success: true, data: summary });
};

const getActivityData = (req, res) => {
  const activity = getActivity();
  res.json({ success: true, data: activity });
};

export { getSummaryData, getActivityData };
