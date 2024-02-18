import { dbclient, handleDBConnection } from '../dbConfig/index.js';
import { compareString } from '../utils/auth.js';

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
