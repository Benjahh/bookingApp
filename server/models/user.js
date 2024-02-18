import { dbclient, handleDBConnection } from '../dbConfig/index.js';
import { compareString, hashedString } from '../utils/auth.js';
import { resetPasswordLink } from '../utils/verifyEmail.js';

export const verifyUserQuery = async (params) => {
  const { userId, token } = params;
  try {
    await handleDBConnection();

    const result = await dbclient.query(
      'SELECT * FROM "emailValidation" WHERE "userId" = $1',
      [userId]
    );

    if (result) {
      const { expiresAt, token: hashedToken } = result.rows;
      console.log(result.fields);
      if (expiresAt < Date.now()) {
        await dbclient.query('DELETE FROM "user" WHERE userId = $1', [userId]);
        await dbclient.query(
          'DELETE FROM "emailValidation" WHERE userId = $1',
          [userId]
        );

        await dbclient.query('COMMIT');
        console.log('Deleted validation, date less');
      } else {
        const isMatch = await compareString(token, hashedToken);

        if (isMatch) {
          const newuser = await dbclient.query(
            'UPDATE "user" SET "verified" = $1 WHERE "id" = $2 RETURNING *',
            [true, userId]
          );
          console.log(newuser.rows[0]);
          await dbclient.query(
            'DELETE FROM "emailValidation" WHERE "userId" = $1',
            [userId]
          );
          await dbclient.query('COMMIT');
          console.log('TOKEN: ', token, '/n hash /n', hashedToken);
          console.log('Validation succes');
        } else {
          console.log('Verification failed or link is invalid');
        }
      }
    } else {
      console.log('verify erororo eoror');
    }
    console.log('Query result', result.rows);
    dbclient.end();
  } catch (error) {
    console.log(error);
  }
};

export const requestPassResetQuery = async (email) => {
  try {
    await handleDBConnection();
    const result = dbclient.query('SELECT * FROM "user" WHERE email = $1', [
      email,
    ]);
    if (!result.rows[0]) {
      return { message: 'Email address not found' };
    } else {
      const user = result.rows[0];
      const result = await dbclient.query(
        'SELECT * FROM "passwordReset WHERE "email" = $1',
        [email]
      );
      const existingRequest = result.rows[0];
      if (existingRequest) {
        if (existingRequest.expiresAt > Date.now()) {
          return { message: 'Password reset already sent. Pending.' };
        }
        await dbclient.query('DELETE FROM "passwordReset" WHERE "email" = $1', [
          email,
        ]);
      }
      await resetPasswordLink(user);
    }

    console.log(user);
    await dbclient.end();
    return { message: '' };
  } catch (error) {}
};

export const createNewPasswordQuery = async ({
  userId,
  email,
  token,
  createdAt,
  expiresAt,
}) => {
  try {
    await dbclient.query(
      'INSERT INTO "passwordReset" (userId, email, token, createdat, expiresat) VALUES $1, $2, $3, $4',
      [userId, email, token, createdAt, expiresAt]
    );
    await dbclient.end();
  } catch (error) {
    console.log(error);
  }
};

export const resetPasswordQuery = async ({ userId, token }) => {
  try {
    await handleDBConnection();
    const result = dbclient.query('SELECT * FROM "user" WHERE "userId" = $1', [
      userId,
    ]);
    if (!result.rows[0]) {
      return { message: 'Invalid password reset, try again' };
    } else {
      const result = await dbclient.query(
        'SELECT * FROM "passwordReset" WHERE "userId" = $1',
        [userId]
      );
      if (!result.rows[0]) {
        return { message: 'No pasword reset sent' };
      }
      const passwordReset = result.rows[0];
      const { expiresAt, token: hashedToken } = passwordReset;
      if (expiresAt < Date.now()) {
        return { message: 'Password reset expired' };
      } else {
        const isMatch = await compareString(token, hashedToken);
        if (isMatch) {
          return { message: 'Matches token' };
        } else {
          console.log('Verification failed or link is invalid');
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export const changePasswordQuery = async ({ userId, password }) => {
  try {
    handleDBConnection();
    const hashedPassword = await hashedString(password);
    const result = dbclient.query(
      'UPDATE "user" SET "password" = $1 WHERE "id" = $2 RETURNING *',
      [password, userId]
    );
    if (result.rows[0]) {
      await dbclient.query('DELETE FROM "passwordReset" WHERE "userId" = $1', [
        userId,
      ]);
      return { message: 'Password reset successfully' };
    }
  } catch (error) {
    console.log(error);
  }
};
