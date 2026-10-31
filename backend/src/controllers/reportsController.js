import { getVisitorsReport as getVisitorsReportService } from '../services/reportsService.js';

const getVisitorsReport = (req, res) => {
  const report = getVisitorsReportService(req.query);
  res.json({ success: true, data: report });
};

export { getVisitorsReport };
