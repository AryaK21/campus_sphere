import { Router } from 'express';
import {
  getPlacements,
  getPlacementById,
  createPlacement,
  updatePlacement,
  deletePlacement,
  addInterviewExperience,
} from '../controllers/placementController';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', getPlacements);
router.get('/:id', getPlacementById);
router.post('/', protect, authorize('Admin', 'Faculty'), createPlacement);
router.put('/:id', protect, authorize('Admin', 'Faculty'), updatePlacement);
router.delete('/:id', protect, authorize('Admin'), deletePlacement);
router.post('/:id/experiences', protect, addInterviewExperience);

export default router;
