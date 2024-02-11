import * as pg from 'pg';
const { client } = pg;
import { compareString, hashedPassword } from '../utils/auth.js';
import { sendVerificationEmail } from '../utils/verifyEmail.js';
import { dbclient } from '../dbConfig';

export const registerAuth = async (body) => {
  try {
    const { firstName, lastName, email, password } = body;
    await handleDBConnection();
    const userExists = await dbclient.query(
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

export const loginAuth = async (body) => {
  try {
    const { email, password } = body;
    await handleDBConnection();
    const user = await dbclient.query(
      'SELECT DISTINCT password FROM users WHERE email = $1 ',
      [email]
    );

    if (!user) {
      return 'Email already exists';
    }

    if (!user?.verified) {
      return console.log(
        'User email is not verified. Check your email account and verify your email'
      );
    }
    const isMatch = await compareString(password, user?.password);

    if (!isMatch) {
      return 'Invalid email or password';
    }

    user.password = undefined;
    const token = createJWT(user?.id);
    res.status(201).json({
      success: true,
      message: 'Login successfully',
      user,
      token,
    });
  } catch (error) {}
};
