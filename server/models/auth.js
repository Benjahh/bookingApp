import * as pg from 'pg';
const { client } = pg;
import { hashedPassword } from '../utils/auth';
import { sendVerificationEmail } from '../utils/verifyEmail';

export const registerAuth = async (body) => {
  try {
    const { firstName, lastName, email, password } = body;
    await handleDBConnection();
    const userExists = await client.query(
      'SELECT DISTINCT email FROM users WHERE email = $1 ',
      [email]
    );
    if (userExists) {
      client.end();
      return 'Email already exists';
    }
    const hashedPass = await hashedPassword(password);
    const user = await client.query(
      'INSERT INTO users (email, password, firstName, lastName) VALUES ($1, $2, $3, $4)',
      [email, hashedPass, firstName, lastName]
    );
    sendVerificationEmail(user, res);
    await client.end();
  } catch (error) {}
};
