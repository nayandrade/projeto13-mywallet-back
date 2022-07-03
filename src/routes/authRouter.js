import { signin, signup } from '../controllers/authControllers.js';
import { validateJoiSignup, validateJoiSignin } from '../middlewares/validateJoi.js';
import { Router } from 'express';

const router = Router()

router.post('/signup', validateJoiSignup, signup)
router.post('/signin', validateJoiSignin, signin)

export default router;