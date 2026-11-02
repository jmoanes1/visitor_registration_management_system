import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { login, logout } from '../controllers/auth.js';

const router = Router();

router.post('/login', login);
router.post('/logout', requireAuth, logout);

export default router;
