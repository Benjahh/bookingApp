import { registerAuth } from '../models/auth.js';
import { validateUser } from '../schema/user.js';

export const register = async (req, res, next) => {
  validation = validateUser(req.body);
  try {
    if (validation.success) {
      await registerAuth(req.body);
    } else {
      console.error(validation.error);
      return res.status(400).message({ message: validation.error });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const login = async (req, res, next) => {
  validation = validateUser(req.body);
  try {
    if (validation.success) {
      await loginAuth(req.body);
    } else {
      console.error(validation.error);
      return res.status(400).message({ message: validation.error });
    }
  } catch (error) {}
};
