import {
  verifyUserQuery,
  requestPassResetQuery,
  changePasswordQuery,
  resetPasswordQuery,
  getUserQuery,
  updateUserQuery,
  sendFriendRequestQuery,
  acceptFriendRequestQuery,
  getFriendRequestQuery,
  getSuggestedFriendsQuery,
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
      const { message, status } = await verifyUserQuery(req.params);
      res.status(201).json({
        message,
        status,
      });
    } else {
      console.error(validation.error);
      return res.status(400).send({ message: validation.error, status });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message, status: 'failed' });
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
  try {
    const { id } = req.params;
    const { userId } = req.body.user;
    console.log('First user id' + id, 'Second user id' + userId);
    const { message, data, status } = await getUserQuery(userId, id);
    res.status(201).json({
      message,
      data,
      status,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: error.message, status: 'failed' });
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    console.log(userId);
    const { lastName, firstName, location, profession } = req.body;
    console.log(req.body);
    if (!(firstName || lastName || contact || profession || location)) {
      next('Please provide all required fields');
      return;
    }

    const { message, status, user, token } = await updateUserQuery(
      userId,
      req.body
    );
    res.status(201).json({ status, message, token, user });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { userId: requestFrom } = req.body.user;
    const { requestTo } = req.body;
    const validation = validateFriendRequest({ requestTo, requestFrom });

    console.log(requestFrom, requestTo);
    if (validation.success) {
      const { message } = await sendFriendRequestQuery(requestTo, requestFrom);
      res.status(201).json({
        message,
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
    const { userId } = req.body.user;
    const { data } = await getFriendRequestQuery(userId);
    res.status(200).json({
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { requestStatus, message } = await acceptFriendRequestQuery(
      req.body,
      userId
    );
    res.status(200).json({
      message,
      requestStatus,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const suggestedFriends = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { message, data, status } = await getSuggestedFriendsQuery(userId);
    res.status(201).json({
      message,
      data,
      status,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: error.message, status: 'failed' });
  }
};
