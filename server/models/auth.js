import { compareString, hashedString, createJWT } from '../utils/auth.js';
import { sendVerificationEmail } from '../utils/verifyEmail.js';
import { dbclient, handleDBConnection } from '../dbConfig/index.js';

export const registerAuth = async (body) => {
  try {
    const { firstName, lastName, email, password } = body;
    await handleDBConnection();
    const userExists = await dbclient.query(
      'SELECT email FROM "user" WHERE email = $1; ',
      [email]
    );

    if (userExists.rows.length > 0) {
      return console.log('Email already exists');
    }
    const hashedPass = await hashedString(password);
    const user = await dbclient.query(
      'INSERT INTO "user" (email, password, firstName, lastName) VALUES ($1, $2, $3, $4) RETURNING * ;',
      [email, hashedPass, firstName, lastName]
    );
    await sendVerificationEmail(user.rows);
    await dbclient.end();
  } catch (error) {
    console.log(error);
  }
};

export const loginAuth = async (body) => {
  try {
    const { email, password } = body;
    await handleDBConnection();
    const user = await dbclient.query(
      'SELECT * FROM "user" WHERE "email" = $1 ',
      [email]
    );

    if (!user.rows[0]) {
      return { message: 'User doesnt exist' };
    }

    if (!user?.rows[0]?.verified) {
      return {
        message:
          'User email is not verified. Check your email account and verify your email',
      };
    }
    const isMatch = await compareString(password, user?.rows[0]?.password);

    if (!isMatch) {
      return { message: 'Invalid email or password' };
    }

    console.log(isMatch);

    user.rows[0].password = undefined;
    console.log(user.rows[0].sid);
    const token = createJWT(user.rows[0].id);
    return { token, message: 'Login success' };
  } catch (error) {
    console.log(error);
  }
};

export const verifyEmailQuery = async (params) => {
  console.log('EMAIL VALIDAATION DATA', params.data);

  const { userId, token, createdAt, expiresAt } = params.data;

  try {
    const result = await dbclient.query(
      'SELECT * FROM "emailValidation" WHERE "userId" = $1',
      [userId]
    );
    console.log('email validationr rsult row', result.rows);
    if (result.rows.length === 0) {
      const email = await dbclient
        .query(
          'INSERT INTO "emailValidation" ("userId", "token", "createdat", "expiresat") VALUES ($1, $2, $3, $4) RETURNING *;',
          [userId, token, createdAt, expiresAt]
        )
        .catch((er) => {
          console.log(er);
        });
      console.log('Verificationn table values created', email);
    } else {
      console.log('values exist');
    }
    dbclient.end();
  } catch (error) {
    console.log(error);
  }
};
