import { verifyUserQuery } from '../models/user.js';
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
