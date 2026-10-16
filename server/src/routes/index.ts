import { Router } from 'express';
import authRoutes from './authRoutes';
import subjectRoutes from './subjectRoutes';
import resourceRoutes from './resourceRoutes';
import forumRoutes from './forumRoutes';
import noticeRoutes from './noticeRoutes';
import placementRoutes from './placementRoutes';
import simulationRoutes from './simulationRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/subjects', subjectRoutes);
router.use('/resources', resourceRoutes);
router.use('/forum', forumRoutes);
router.use('/notices', noticeRoutes);
router.use('/placements', placementRoutes);
router.use('/simulations', simulationRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'CampusSphere API Engine',
    timestamp: new Date().toISOString(),
  });
});

export default router;
