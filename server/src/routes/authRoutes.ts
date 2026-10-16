import { Router } from 'express';
import {
  register,
  getMe,
  updateProfile,
  toggleSaveResource,
  getPublicProfile,
  validateEmail,
  demoLogin,
} from '../controllers/authController';
import { protect } from '../middlewares/auth';
import { authRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/demo-login', demoLogin);
router.post('/register', authRateLimiter, protect, register);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/save-resource/:resourceId', protect, toggleSaveResource);
router.get('/user/:userId', getPublicProfile);
router.post('/validate-email', validateEmail);

export default router;
