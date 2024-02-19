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

    const userResult = await dbclient
      .query('SELECT * FROM "user" WHERE email = $1', [email])
      .catch((err) => console.log(err));

    if (!userResult.rows[0]) {
      console.log('Email address not found');
      return { message: 'Email address not found' };
    }

    const user = userResult.rows[0];
    console.log(user);

    const passwordResetResult = await dbclient
      .query('SELECT * FROM "passwordReset" WHERE "email" = $1', [email])
      .catch((err) => console.log(err));

    const existingRequest = passwordResetResult.rows[0];

    if (existingRequest) {
      if (existingRequest.expiresat < Date.now()) {
        return { message: 'Password reset link already sent. Pending.' };
      }

      await dbclient
        .query('DELETE FROM "passwordReset" WHERE "email" = $1', [email])
        .catch((err) => console.log(err));
      await dbclient.end();
      return { message: 'Password reset link expired. Send again' };
    } else {
      await resetPasswordLink(user);
      await dbclient.end();
      return { message: 'Pasword reset link reset generated' };
    }
  } catch (error) {
    console.log(error);
  }
};

export const createNewPasswordQuery = async ({
  userId,
  email,
  token,
  createdAt,
  expiresAt,
}) => {
  try {
    const result = await dbclient
      .query(
        'INSERT INTO "passwordReset" ("userId", email, token, createdat, expiresat) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, email, token, createdAt, expiresAt]
      )
      .catch((err) => console.log(err));
  } catch (error) {
    console.log(error);
  }
};

export const resetPasswordQuery = async ({ userId, token }) => {
  try {
    await handleDBConnection();
    const result = await dbclient
      .query('SELECT * FROM "user" WHERE "id" = $1', [userId])
      .catch((err) => console.log(err));

    console.log(result);
    if (!result.rows[0]) {
      return { message: 'Invalid password reset, try again' };
    } else {
      const result = await dbclient
        .query('SELECT * FROM "passwordReset" WHERE "userId" = $1', [userId])
        .catch((err) => console.log(err));
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
    console.log('PSS', hashedPassword);
    const result = await dbclient
      .query('UPDATE "user" SET "password" = $1 WHERE "id" = $2 RETURNING *', [
        hashedPassword,
        userId,
      ])
      .catch((err) => console.log(err));

    console.log(result.rows[0]);
    if (result.rows[0]) {
      await dbclient
        .query('DELETE FROM "passwordReset" WHERE "userId" = $1', [userId])
        .catch((err) => console.log(err));
      return { message: 'Password reset successfully' };
    }
    dbclient.end();
  } catch (error) {
    console.log(error);
  }
};
