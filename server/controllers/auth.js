import { registerAuth, loginAuth } from '../models/auth.js';
import { validateUser } from '../schema/user.js';

export const register = async (req, res, next) => {
  const validation = validateUser(req.body);
  try {
    if (validation.success) {
      await registerAuth(req.body);
      res.send('<h1>Register </h1>');
    } else {
      console.error(validation.error);
      return res.status(400).send({ message: validation.error });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginAuth(req.body);
    console.log(result);
    res.status(201).json({
      token: result.token,
      message: result.message,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
