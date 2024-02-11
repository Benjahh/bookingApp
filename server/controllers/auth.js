import { registerAuth } from '../models/auth.js';
import { validateUser } from '../schema/user.js';

const register = async (req, res, next) => {
  validation = validateUser(req.body);
  try {
    if (validation.success) {
      await registerAuth(req.body);
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
