import { Router } from 'express';
import {
  getSimulations,
  getSimulationBySlug,
  recordSimulationRun,
} from '../controllers/simulationController';

const router = Router();

router.get('/', getSimulations);
router.get('/:slug', getSimulationBySlug);
router.post('/:slug/run', recordSimulationRun);

export default router;
