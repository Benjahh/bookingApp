import { verifyEmailQuery } from '../models/user';
import { validateEmailVerification } from '../schema/emailVerification';

export const verifyEmail = async (req, res, next) => {
  const validation = validateEmailVerification(req.params);
  try {
    if (validation.success) {
      await verifyEmailQuery(req.params);
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
