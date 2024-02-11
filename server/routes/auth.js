import { Router } from 'express';
import { loginAuth, registerAuth } from '../models/auth.js';

export const authRouter = Router();

authRouter.post('/register', registerAuth);
authRouter.post('/register', loginAuth);
