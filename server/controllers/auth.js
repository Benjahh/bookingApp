import { registerAuth, loginAuth } from '../models/auth.js';
import { validateUser } from '../schema/user.js';

export const register = async (req, res, next) => {
  const validation = validateUser(req.body);
  try {
    if (validation.success) {
      const { message, status } = await registerAuth(req.body);
      res.status(201).json({
        message,
        status,
      });
    } else {
      console.error(validation.error);
      return res
        .status(400)
        .send({ message: validation.error, status: 'Validation failed' });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message, status: 'failed' });
  }
};

export const login = async (req, res, next) => {
  try {
    const { status, token, message, user } = await loginAuth(req.body);
    res.status(201).json({
      token,
      message,
      status,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message, status: 'failed' });
  }
};
