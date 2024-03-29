import {
  verifyUserQuery,
  requestPassResetQuery,
  changePasswordQuery,
  resetPasswordQuery,
  getUserQuery,
  updateUserQuery,
  sendFriendRequestQuery,
  acceptFriendRequestQuery,
} from '../models/user.js';

import { validateFriendRequest } from '../schema/friendRequest.js';
import { validateEmailVerification } from '../schema/emailVerification.js';
import { validatePasswordReset } from '../schema/passwordReset.js';
import { validateUser } from '../schema/user.js';

export const verifyEmail = async (req, res, next) => {
  console.log(req.params);
  const validation = validateEmailVerification(req.params);
  try {
    if (validation.success) {
      await verifyUserQuery(req.params);
      res.send('<h1> Verified Email </h1>');
    } else {
      console.error(validation.error);
      return res.status(400).send({ message: validation.error });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const requestPassReset = async (req, res, next) => {
  console.log(req.body);
  try {
    const { email } = req.body;
    const result = await requestPassResetQuery(email);

    console.log(result);
    res.status(201).send({
      message: result.message,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const resetPassword = async (req, res, next) => {
  console.log(req.params);
  const result = await resetPasswordQuery(req.params);
  res.status(201).json({
    message: result.message,
  });
  try {
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const result = await changePasswordQuery(req.body);
    res.status(201).json({
      message: result.message,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getUser = async (req, res, next) => {
  console.log(req.body);
  try {
    const { id } = req.params;
    const { userId } = req.body.user;
    const { message, user } = await getUserQuery(userId, id);
    res.status(201).json({
      message,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: error.message });
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { lastName, firstName, location, profession } = req.body;
    if (!(firstName || lastName || contact || profession || location)) {
      next('Please provide all required fields');
      return;
    }
    const validation = validateUser(req.body);

    if (validation.success) {
      const { message, user, token } = await updateUserQuery(
        userId,
        validation.data
      );
      res.status(201).json({
        message,
        token,
        user,
      });
    } else {
      console.log(validation.error);
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { requestTo } = req.body;
    const validation = validateFriendRequest({
      requestTo,
      requestFrom: userId,
    });
    if (validation.success) {
      const result = await sendFriendRequestQuery(userId, req.body);
      res.status(201).json({
        message: result.message,
      });
    } else {
      console.log(validation.error);
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getFriendRequest = async (req, res) => {
  try {
    if (!req.body.user) {
      next('Friend request user error');
    }
    const result = await getFriendRequestQuery(req.body);
    res.status(200).json({
      data: result.data,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const id = req.body.user.userId;
    const result = await acceptFriendRequestQuery(req.body, id);
  } catch (error) {}
};
