import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { visitorsReport } from '../controllers/reports.js';

const router = Router();

router.use(requireAuth);

router.get('/visitors', visitorsReport);

export default router;
