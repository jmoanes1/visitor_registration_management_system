import express from 'express';
import { getVisitorsReport } from '../controllers/reportsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/visitors', authMiddleware, getVisitorsReport);

export default router;
