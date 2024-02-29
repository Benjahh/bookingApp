import { compareString, hashedString, createJWT } from '../utils/auth.js';
import { sendVerificationEmail } from '../utils/verifyEmail.js';
import { dbclient, handleDBConnection } from '../dbConfig/index.js';

export const registerAuth = async ({
  firstName,
  lastName,
  email,
  password,
}) => {
  try {
    const {
      rows: [user],
    } = await dbclient.query('SELECT email FROM "user" WHERE email = $1; ', [
      email,
    ]);

    if (user) {
      return { message: 'Email already exists', status: 'failed' };
    } else {
      const hashedPass = await hashedString(password);

      const {
        rows: [newUser],
      } = await dbclient.query(
        'INSERT INTO "user" (email, password, firstName, lastName) VALUES ($1, $2, $3, $4) RETURNING * ;',
        [email, hashedPass, firstName, lastName]
      );
      await sendVerificationEmail(newUser);
      return {
        status: 'pending',
        message:
          'Verification email has been sent to your account. Check your email for further instructions.',
      };
    }
  } catch (error) {
    console.log(error);
  }
};

export const loginAuth = async ({ email, password }) => {
  try {
    const {
      rows: [user],
    } = await dbclient.query('SELECT * FROM "user" WHERE "email" = $1 ', [
      email,
    ]);

    if (!user) {
      return { message: 'User doesnt exist', status: 'failed' };
    }

    if (!user?.verified) {
      return {
        message:
          'User email is not verified. Check your email account and verify your email',
        status: 'pending',
      };
    }
    const isMatch = await compareString(password, user?.password);

    if (!isMatch) {
      return { message: 'Invalid email or password', status: 'failed' };
    }

    user.password = undefined;

    const token = createJWT(user.id);
    return { token, message: 'Login success', status: 'success', user };
  } catch (error) {
    console.log(error);
  }
};

export const verifyEmailQuery = async ({
  userId,
  token,
  createdAt,
  expiresAt,
}) => {
  try {
    const {
      rows: [validationEmail],
    } = await dbclient.query(
      'SELECT * FROM "emailValidation" WHERE "userId" = $1',
      [userId]
    );

    if (!validationEmail) {
      await dbclient.query(
        'INSERT INTO "emailValidation" ("userId", "token", "createdat", "expiresat") VALUES ($1, $2, $3, $4) RETURNING *;',
        [userId, token, createdAt, expiresAt]
      );
    } else {
      return {
        message:
          'Email vailidaation has been already sent. Confirm in your email.',
        status: 'pending',
      };
    }
  } catch (error) {
    console.log(error);
  }
};
