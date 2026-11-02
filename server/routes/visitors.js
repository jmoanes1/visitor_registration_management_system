import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { validateCreate, validateUpdate } from '../middleware/validateVisitor.js';
import {
  listVisitors,
  getVisitor,
  createVisitor,
  updateVisitor,
  checkInVisitor,
  checkOutVisitor,
  cancelVisitor,
  deleteVisitor,
} from '../controllers/visitors.js';

const router = Router();

router.use(requireAuth);

router.get('/', listVisitors);
router.get('/:id', getVisitor);
router.post('/', validateCreate, createVisitor);
router.patch('/:id', validateUpdate, updateVisitor);
router.post('/:id/check-in', checkInVisitor);
router.post('/:id/check-out', checkOutVisitor);
router.post('/:id/cancel', cancelVisitor);
router.delete('/:id', deleteVisitor);

export default router;
