import { Router } from 'express';
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', getSubjects);
router.get('/:id', getSubjectById);
router.post('/', protect, authorize('Admin', 'Faculty'), createSubject);
router.put('/:id', protect, authorize('Admin', 'Faculty'), updateSubject);
router.delete('/:id', protect, authorize('Admin'), deleteSubject);

export default router;
