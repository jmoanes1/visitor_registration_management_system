import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { getSummary, getActivity } from '../controllers/dashboard.js';

const router = Router();

router.use(requireAuth);

router.get('/summary', getSummary);
router.get('/activity', getActivity);

export default router;
