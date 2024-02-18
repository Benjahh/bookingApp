import {
  verifyUserQuery,
  requestPassResetQuery,
  changePasswordQuery,
} from '../models/user.js';
import { validateEmailVerification } from '../schema/emailVerification.js';

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
  try {
    const validation = await validatePasswordReset(req.body);
    if (validation.success) {
      const { email } = req.body;
      const result = await requestPassResetQuery(email);
      res.status(201).json({
        message: result.message,
      });
    }
    res.status(401).send({ message: validation.error });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const resetPassword = (req, res) => {
  const { userId, token } = req.params;
  try {
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const result = await changePasswordQuery(userId, password);
    res.status(201).json({
      message: result.message,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
