import { report } from '../services/reports.js';

const visitorsReport = (req, res) => {
  res.json({ success: true, data: report(req.query) });
};

export { visitorsReport };
