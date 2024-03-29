import { getFriendRequest } from '../controllers/user.js';
import { dbclient, handleDBConnection } from '../dbConfig/index.js';
import { compareString, createJWT, hashedString } from '../utils/auth.js';
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

export const getUserQuery = async (userId, id) => {
  console.log(userId);
  try {
    await handleDBConnection();
    const {
      rows: [user],
    } = await dbclient.query('SELECT * FROM "user" WHERE id = $1 OR id = $2', [
      userId,
      id,
    ]);
    console.log(user);
    if (!user) {
      return { message: 'No such user' };
    } else {
      user.password = undefined;
      return {
        message: 'User query true',
        user,
      };
    }
  } catch (error) {
    console.log(error);
  } finally {
    await dbclient.end();
  }
};

export const updateUserQuery = async (
  userId,
  { firstName, lastName, location, profileUrl, profession }
) => {
  try {
    await handleDBConnection();
    const {
      rows: [user],
    } = await dbclient.query(
      'UPDATE "user" SET firstname = $2, lastname = $3, location = $4, profileurl = $5, profession = $6 WHERE id = $1 RETURNING *',
      [userId, firstName, lastName, location, profileUrl, profession]
    );

    console.log(user);
    if (!user) {
      return { message: 'No such user' };
    } else {
      const token = createJWT(user?.userId);
      user.password = undefined;
      return {
        message: 'User update true',
        user,
        token,
      };
    }
  } catch (error) {
    console.log(error);
  } finally {
    await dbclient.end();
  }
};

export const sendFriendRequestQuery = async (requestFrom, requestTo) => {
  try {
    await handleDBConnection();
    const requestToExist = await dbclient
      .query(
        'SELECT * FROM "friendRequest" WHERE "requestFrom" = $1 AND "requestTo" = $2',
        [requestFrom, requestTo]
      )
      .catch((err) => console.log(err));
    if (requestToExist.rows[0]) {
      return { message: 'Friend request already sent' };
    }

    const requestFromExist = await dbclient
      .query(
        'SELECT * FROM "friendRequest" WHERE "requestFrom" = $1 AND "requestTo" = $2',
        [requestTo, requestFrom]
      )
      .catch((err) => console.log(err));

    if (requestFromExist.rows[0]) {
      return { message: 'Friend request already received' };
    }

    const result = await dbclient.query(
      'INSERT INTO "friendRequest" ("requestFrom", "requestTo") VALUES ($1, $2)',
      [requestFrom, requestTo]
    );

    if (result.rows[0]) {
      return { message: 'Friend request sent' };
    }
  } catch (err) {
    console.log(err);
  } finally {
    await dbclient.end();
  }
};
export const getFriendRequestQuery = async (requestTo) => {
  try {
    await handleDBConnection();
    const friendRequest = await dbclient.query(
      'SELECT "requestFrom" FROM "friendRequest" WHERE "requestTo" = $1 AND "requestStatus" = "Pending"',
      [requestTo]
    );
    return { data: friendRequest.rows[0] };
  } catch (error) {
    console.log(error);
  } finally {
    await dbclient.end();
  }
};

export const acceptFriendRequestQuery = async (
  { status, requestId },
  userId
) => {
  try {
    await handleDBConnection();
    const {
      rows: [requestExist],
    } = await dbclient.query(
      'SELECT * FROM "friendRequest" WHERE "requestId" = $1 ',
      [requestId]
    );

    if (!requestExist) {
      return { message: 'Friend request not found' };
    }

    const {
      rows: [friendRequest],
    } = await dbclient.query(
      'UPDATE "friendRequest" SET "requestStatus" = $1 WHERE "requestId" = $2',
      [status, requestId]
    );

    if (status === 'Accepted') {
      await dbclient.query(
        'INSERT INTO "user" ("friends") VALUES $2 WHERE "userId" = $1',
        [userId, friendRequest.requestTo]
      );
      await dbclient.query(
        'INSERT INTO  "user" ("friends") VALUES = $2 WHERE "userId" = $1 ',
        [friendRequest.requestFrom, friendRequest.requestTo]
      );
    }
    return { message: 'Friend Request', status };
  } catch (error) {
    console.log(error);
  } finally {
    await dbclient.end();
  }
};
