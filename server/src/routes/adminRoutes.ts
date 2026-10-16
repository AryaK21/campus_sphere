import { Router } from 'express';
import {
  getSystemAnalytics,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from '../controllers/adminController';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

// Restricted to Admins only
router.get('/analytics', protect, authorize('Admin', 'Faculty'), getSystemAnalytics);
router.get('/users', protect, authorize('Admin'), getAllUsers);
router.patch('/users/:userId/role', protect, authorize('Admin'), updateUserRole);
router.delete('/users/:userId', protect, authorize('Admin'), deleteUser);

export default router;
