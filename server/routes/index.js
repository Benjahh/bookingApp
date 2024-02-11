import { Router } from 'express';
import { authRouter } from './auth.js';

export const router = Router();

router.use('/auth', authRouter);
