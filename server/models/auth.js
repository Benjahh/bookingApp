import { compareString, hashedString } from '../utils/auth.js';
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
      'SELECT DISTINCT password FROM "user" WHERE email = $1 ',
      [email]
    );

    console.log(user.rows);
    if (!user) {
      return 'Invalid email or password';
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
  } catch (error) {
    console.log(error);
  }
};

export const verifyEmailQuery = async (params) => {
  console.log('PARRAM', params);

  const { userId, token, createdAt, expiresAt } = params.data;
  try {
    const result = await dbclient.query(
      'INSERT INTO "emailValidation" VALUES ($1, $2, $3, $4) RETURNING *;',
      [userId, token, createdAt, expiresAt]
    );
    console.log('Query result', result);
    dbclient.end();
  } catch (error) {
    console.log(error);
  }
};
