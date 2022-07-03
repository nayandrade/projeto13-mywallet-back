import { deleteSession } from '../controllers/userControllers.js';
import { Router } from 'express';

const router = Router()

router.delete('/session', deleteSession)

export default router;