import { Router } from 'express';
import path from 'path';
import {
  changePassword,
  requestPassReset,
  resetPassword,
  verifyEmail,
} from '../controllers/user.js';
import { resetPasswordLink } from '../utils/verifyEmail.js';

const __dirname = path.resolve(path.dirname(''));
export const userRouter = Router();

userRouter.get('/verify/:userId/:token', verifyEmail);

userRouter.post('/request-passwordreset', requestPassReset);
userRouter.get('/reset-password/:userId/:token', resetPassword);
userRouter.post('/reset-password', changePassword);

userRouter.get('/verified', (req, res) => {
  res.sendFile(path.join(__dirname, './views/verifiedPage.html'));
});

userRouter.get('/resetpassword', (req, res) => {
  res.sendFile(path.join(__dirname, './views/verifiedPage.html'));
});
