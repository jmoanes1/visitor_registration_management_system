import express from 'express';
import {
  getVisitors,
  getVisitor,
  createVisitorEntry,
  updateVisitorEntry,
  checkIn,
  checkOut,
  cancel,
  deleteVisitorEntry,
} from '../controllers/visitorController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validateVisitor from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getVisitors);
router.get('/:id', authMiddleware, getVisitor);
router.post('/', authMiddleware, validateVisitor, createVisitorEntry);
router.patch('/:id', authMiddleware, validateVisitor, updateVisitorEntry);
router.post('/:id/check-in', authMiddleware, checkIn);
router.post('/:id/check-out', authMiddleware, checkOut);
router.post('/:id/cancel', authMiddleware, cancel);
router.delete('/:id', authMiddleware, deleteVisitorEntry);

export default router;
