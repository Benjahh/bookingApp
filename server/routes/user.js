import { Router } from 'express';
import path from 'path';

const __dirname = path.resolve(path.dirname(''));
const userRouter = Router();

userRouter.get('/verify/:userId/:token', verif);
