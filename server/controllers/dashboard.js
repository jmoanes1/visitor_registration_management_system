import { summary, activity } from '../services/dashboard.js';

const getSummary = (req, res) => {
  res.json({ success: true, data: summary() });
};

const getActivity = (req, res) => {
  res.json({ success: true, data: activity() });
};

export { getSummary, getActivity };
