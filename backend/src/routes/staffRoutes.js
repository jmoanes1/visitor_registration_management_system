import express from 'express';
import {
  getStaff,
  getStaffEntry,
  createStaffEntry,
  updateStaffEntry,
  toggleStaff,
} from '../controllers/staffController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getStaff);
router.get('/:id', authMiddleware, getStaffEntry);
router.post('/', authMiddleware, createStaffEntry);
router.patch('/:id', authMiddleware, updateStaffEntry);
router.patch('/:id/toggle', authMiddleware, toggleStaff);

export default router;
