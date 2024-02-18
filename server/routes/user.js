import { Router } from 'express';
import path from 'path';
import { verifyEmail } from '../controllers/user.js';

const __dirname = path.resolve(path.dirname(''));
export const userRouter = Router();

userRouter.get('/verify/:userId/:token', verifyEmail);

userRouter.get('verified', (req, res) => {
  res.sendFile(path.join(__dirname, './views/verifiedPage.html'));
});
