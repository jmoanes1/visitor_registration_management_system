import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { listStaff, createStaff, toggleStaff } from '../controllers/staff.js';

const router = Router();

router.use(requireAuth);

router.get('/', listStaff);
router.post('/', createStaff);
router.patch('/:id/toggle', toggleStaff);

export default router;
