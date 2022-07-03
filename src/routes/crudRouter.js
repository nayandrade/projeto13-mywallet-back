import { getTransaction, postTransaction } from '../controllers/crudControllers.js';
import { Router } from 'express';

const router = Router()

router.post('/transaction', postTransaction)
router.get('/transaction', getTransaction)

export default router;