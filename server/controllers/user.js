import {
  verifyUserQuery,
  requestPassResetQuery,
  changePasswordQuery,
  resetPasswordQuery,
} from '../models/user.js';

import { validateEmailVerification } from '../schema/emailVerification.js';
import { validatePasswordReset } from '../schema/passwordReset.js';

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

export const requestPassReset = async (req, res) => {
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

export const resetPassword = async (req, res) => {
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

export const changePassword = async (req, res) => {
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
