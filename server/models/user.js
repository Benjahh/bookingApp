import { getLogger } from 'nodemailer/lib/shared/index.js';

import { getFriendRequest } from '../controllers/user.js';
import { dbclient } from '../dbConfig/index.js';
import { compareString, createJWT, hashedString } from '../utils/auth.js';
import { resetPasswordLink } from '../utils/verifyEmail.js';

export const verifyUserQuery = async ({ userId, token }) => {
  try {
    const {
      rows: [emailValidation],
    } = await dbclient.query(
      'SELECT * FROM "emailValidation" WHERE "userId" = $1',
      [userId]
    );

    if (emailValidation) {
      const { expiresAt, token: hashedToken } = emailValidation;

      if (expiresAt < Date.now()) {
        await dbclient.query('DELETE FROM "user" WHERE "id" = $1', [userId]);
        await dbclient.query(
          'DELETE FROM "emailValidation" WHERE "userId" = $1',
          [userId]
        );

        await dbclient.query('COMMIT');
        return {
          message: 'Verification email, valitdation expired. Register again.',
          status: 'failed',
        };
      } else {
        const isMatch = await compareString(token, hashedToken);

        if (isMatch) {
          await dbclient.query(
            'UPDATE "user" SET "verified" = $1 WHERE "id" = $2',
            [true, userId]
          );

          await dbclient.query(
            'DELETE FROM "emailValidation" WHERE "userId" = $1',
            [userId]
          );

          return {
            message: 'User validation complete, valitdation expired. Log in.',
            status: 'success',
          };
        }
      }
    } else {
      await dbclient.query('DELETE FROM "user" WHERE "id" = $1', [userId]);
      await dbclient.query(
        'DELETE FROM "emailValidation" WHERE "userId" = $1',
        [userId]
      );
      return {
        message: 'Verification failed or link is invalid. Register again.',
        status: 'failed',
      };
    }
  } catch (error) {
    console.log(error);
    return { message: error.message, status: 'failed' };
  }
};

export const requestPassResetQuery = async (email) => {
  try {
    const userResult = await dbclient
      .query('SELECT * FROM "user" WHERE email = $1', [email])
      .catch((err) => console.log(err));

    if (!userResult.rows[0]) {
      console.log('Email address not found');
      return { message: 'Email address not found' };
    }

    const user = userResult.rows[0];

    const passwordResetResult = await dbclient.query(
      'SELECT * FROM "passwordReset" WHERE "email" = $1',
      [email]
    );

    const existingRequest = passwordResetResult.rows[0];

    if (existingRequest) {
      if (existingRequest.expiresat < Date.now()) {
        return { message: 'Password reset link already sent. Pending.' };
      }

      await dbclient.query('DELETE FROM "passwordReset" WHERE "email" = $1', [
        email,
      ]);

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
    const result = await dbclient.query(
      'INSERT INTO "passwordReset" ("userId", email, token, createdat, expiresat) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, email, token, createdAt, expiresAt]
    );
  } catch (error) {
    console.log(error);
  }
};

export const resetPasswordQuery = async ({ userId, token }) => {
  try {
    const result = await dbclient.query(
      'SELECT * FROM "user" WHERE "id" = $1',
      [userId]
    );

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
    const hashedPassword = await hashedString(password);

    const result = await dbclient.query(
      'UPDATE "user" SET "password" = $1 WHERE "id" = $2 RETURNING *',
      [hashedPassword, userId]
    );

    if (result.rows[0]) {
      await dbclient.query('DELETE FROM "passwordReset" WHERE "userId" = $1', [
        userId,
      ]);

      return { message: 'Password reset successfully' };
    }
    dbclient.end();
  } catch (error) {
    console.log(error);
  }
};

export const getUserQuery = async (userId, id) => {
  try {
    const {
      rows: [user],
    } = await dbclient.query('SELECT * FROM "user" WHERE id = $1 OR id = $2;', [
      userId,
      id,
    ]);
    const { rows: friend } = await dbclient
      .query(
        `
        SELECT 
            "user".profession AS "userProfession",
            "user".lastname AS "userLastName",
            "user".firstname AS "userFirstName",
            "user".id AS "userId",
            "user".profileurl AS "userProfileUrl"
        FROM 
            "user"
        WHERE 
           "user".id IN (
                SELECT 
                    CASE 
                        WHEN ("user1Id" = $1 OR "user1Id" = $2) THEN "user2Id"
                        ELSE "user1Id"
                    END AS "friendId"
                FROM 
                    friendships
                WHERE 
                    ("user1Id" = $1 OR "user2Id" = $1)
            );
        `,
        [userId, id]
      )
      .catch((err) => console.log(err));
    console.log(friend);
    if (!user) {
      return { message: 'No such user exists in database', status: 'failed' };
    } else {
      user.password = undefined;
      return {
        message: 'User info retrieval ssucces',
        data: {
          user: {
            ...user,
            friends: friend ?? null,
          },
        },
        status: 'success',
      };
    }
  } catch (error) {
    console.log(error);
    return { status: 'failed', message: 'Internal Server Error' };
  }
};

export const updateUserQuery = async (
  userId,
  { firstName, lastName, location, profileUrl, profession }
) => {
  try {
    const {
      rows: [user],
    } = await dbclient.query(
      'UPDATE "user" SET firstname = $2, lastname = $3, location = $4, profileurl = $5, profession = $6 WHERE id = $1 RETURNING *',
      [userId, firstName, lastName, location, profileUrl ?? '', profession]
    );

    if (!user) {
      return { message: 'No such user', status: 'failed' };
    } else {
      const token = createJWT(user?.userId);
      user.password = undefined;
      return {
        message: 'User updated',
        user,
        token,
        status: 'success',
      };
    }
  } catch (error) {
    console.log(error);
    return { status: 'failed', message: 'Internal Server Error' };
  }
};

export const sendFriendRequestQuery = async (requestTo, requestFrom) => {
  try {
    const {
      rows: [requestToExist],
    } = await dbclient.query(
      'SELECT * FROM "friendRequest" WHERE "requestFrom" = $1 AND "requestTo" = $2',
      [requestFrom, requestTo]
    );

    if (requestToExist) {
      return { message: 'Friend request already sent' };
    }

    const {
      rows: [requestFromExist],
    } = await dbclient.query(
      'SELECT * FROM "friendRequest" WHERE "requestFrom" = $1 AND "requestTo" = $2',
      [requestTo, requestFrom]
    );

    if (requestFromExist) {
      return { message: 'Friend request already received' };
    }

    const {
      rows: [createdFriendRequest],
    } = await dbclient.query(
      'INSERT INTO "friendRequest" ("requestFrom", "requestTo", "requestStatus") VALUES ($1, $2, $3) RETURNING *',
      [requestFrom, requestTo, 'Pending']
    );

    if (createdFriendRequest) {
      return { message: 'Friend request sent' };
    }
  } catch (err) {
    console.log(err);
  }
};
export const getFriendRequestQuery = async (requestTo) => {
  try {
    console.log('SENT TO', requestTo);
    const { rows: friendRequest } = await dbclient.query(
      'SELECT "friendRequest".rowid AS "requestId", "user".lastname AS "userLastName", "user".firstname AS "userFirstName", "user".profileurl AS "userProfileUrl", "user".profession AS "userProfession" FROM "friendRequest" INNER JOIN "user" ON "friendRequest"."requestFrom" = "user".id WHERE "friendRequest"."requestTo" = $1 AND "friendRequest"."requestStatus" = $2',
      [requestTo, 'Pending']
    );
    console.log(friendRequest);
    return { data: friendRequest };
  } catch (error) {
    console.log(error);
  }
};

export const acceptFriendRequestQuery = async (
  { status: requestStatus, rid: requestId },
  userId
) => {
  try {
    const {
      rows: [requestExist],
    } = await dbclient.query(
      'SELECT * FROM "friendRequest" WHERE rowid = $1 ',
      [requestId]
    );

    if (!requestExist) {
      return { message: 'Friend request not found' };
    }

    const {
      rows: [friendRequest],
    } = await dbclient.query(
      'UPDATE "friendRequest" SET "requestStatus" = $1 WHERE rowid = $2 RETURNING *',
      [requestStatus, requestId]
    );

    if (requestStatus === 'Accepted') {
      await dbclient.query(
        'INSERT INTO "friendships" ("user1Id", "user2Id") VALUES ($1, $2) RETURNING *',
        [userId, friendRequest.requestFrom]
      );

      await dbclient.query('DELETE FROM "friendRequest" WHERE rowid = $1', [
        requestId,
      ]);

      return { message: 'Friend Request', requestStatus };
    } else {
      await dbclient.query('DELETE FROM "friendRequest" WHERE rowid = $1', [
        requestId,
      ]);
      return { message: 'Friend Request Denied', requestStatus };
    }
  } catch (error) {
    console.log(error);
  }
};

export const getSuggestedFriendsQuery = async (userId) => {
  try {
    const { rows: suggestedUsers } = await dbclient.query(
      `
        SELECT 
            "user".profession AS "userProfession",
            "user".lastname AS "userLastName",
            "user".firstname AS "userFirstName",
            "user".id AS "userId",
            "user".profileurl AS "userProfileUrl"
        FROM 
            "user"
        WHERE 
            "user".id <> $1
            AND "user".id NOT IN (
                SELECT 
                    CASE 
                        WHEN "user1Id" = $1 THEN "user2Id"
                        ELSE "user1Id"
                    END AS "friendId"
                FROM 
                    friendships
                WHERE 
                    ("user1Id" = $1 OR "user2Id" = $1)
            );
        `,
      [userId]
    );
    return {
      message: 'Suggested users',
      data: suggestedUsers,
      status: 'success',
    };
  } catch (error) {
    console.log(error);
    return { status: 'failed', message: 'Internal Server Error' };
  }
};
