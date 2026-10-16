import { Router } from 'express';
import {
  getResources,
  getResourceById,
  uploadResource,
  rateResource,
  recordDownload,
  deleteResource,
} from '../controllers/resourceController';
import { protect } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.get('/', getResources);
router.get('/:id', getResourceById);
router.post('/upload', protect, upload.single('file'), uploadResource);
router.post('/:id/rate', protect, rateResource);
router.post('/:id/download', recordDownload);
router.delete('/:id', protect, deleteResource);

export default router;
