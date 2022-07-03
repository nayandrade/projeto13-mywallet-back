import { getTransaction, postTransaction } from '../controllers/crudControllers.js';
import { validateJoiPostTransaction } from '../middlewares/validateJoi.js';
import { Router } from 'express';

const router = Router()

router.post('/transaction', validateJoiPostTransaction, postTransaction)
router.get('/transaction', getTransaction)

export default router;