import { Router } from 'express';
import {
  getNotices,
  getNoticeById,
  createNotice,
  togglePinNotice,
  deleteNotice,
} from '../controllers/noticeController';
import { protect, authorize } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.get('/', getNotices);
router.get('/:id', getNoticeById);
router.post('/', protect, authorize('Admin', 'Faculty'), upload.single('attachment'), createNotice);
router.patch('/:id/pin', protect, authorize('Admin', 'Faculty'), togglePinNotice);
router.delete('/:id', protect, authorize('Admin', 'Faculty'), deleteNotice);

export default router;
