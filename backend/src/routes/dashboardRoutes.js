import express from 'express';
import { getSummaryData, getActivityData } from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summary', authMiddleware, getSummaryData);
router.get('/activity', authMiddleware, getActivityData);

export default router;
