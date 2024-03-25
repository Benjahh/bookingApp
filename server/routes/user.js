import { Router } from 'express';
import path from 'path';
import {
  acceptFriendRequest,
  changePassword,
  getFriendRequest,
  getUser,
  requestPassReset,
  resetPassword,
  sendFriendRequest,
  updateUser,
  verifyEmail,
  suggestedFriends,
} from '../controllers/user.js';
import userAuth from '../middleware/authMiddleware.js';

const __dirname = path.resolve(path.dirname(''));
export const userRouter = Router();

userRouter.get('/verify/:userId/:token', verifyEmail);

userRouter.post('/request-passwordreset', requestPassReset);
userRouter.get('/reset-password/:userId/:token', resetPassword);
userRouter.post('/reset-password', changePassword);

userRouter.post('/get-user/:id?', userAuth, getUser);
userRouter.put('/update-user', userAuth, updateUser);

userRouter.post('/friend-request', userAuth, sendFriendRequest);
userRouter.post('/get-friend-request', userAuth, getFriendRequest);
userRouter.post('/accept-request', userAuth, acceptFriendRequest);

userRouter.post('/suggested-friends', userAuth, suggestedFriends);

userRouter.get('/verified', (req, res) => {
  res.sendFile(path.join(__dirname, './views/verifiedPage.html'));
});

userRouter.get('/resetpassword', (req, res) => {
  res.sendFile(path.join(__dirname, './views/verifiedPage.html'));
});
