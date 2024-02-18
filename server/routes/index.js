import { Router } from 'express';
import { authRouter } from './auth.js';
import { userRouter } from './user.js';

export const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
