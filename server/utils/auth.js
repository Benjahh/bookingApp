import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';

export const hashedString = async (string) => {
  console.log(string);
  const salt = await bcrypt.genSalt(10);
  const stringHash = await bcrypt.hash(string, salt);
  return stringHash;
};

export const compareString = async (userString, string) => {
  const isMatch = await bcrypt.compare(userString, string);
  return isMatch;
};

export const createJWT = (id) => {
  return JWT.sign({ userId: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: '1d',
  });
};
