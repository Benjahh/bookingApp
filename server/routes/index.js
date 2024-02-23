import { Router } from 'express';
import { authRouter } from './auth.js';
import { userRouter } from './user.js';
import { postRouter } from './post.js';

export const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/posts', postRouter);
