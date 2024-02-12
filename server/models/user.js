import { dbclient, handleDBConnection } from '../dbConfig/index.js';

export const verifyUserQuery = async (params) => {
  const { userId, email } = params;
  try {
    await handleDBConnection();
    const result = await dbclient.query('SELECT verify');
    await dbclient.end();
  } catch (error) {
    console.log(error.message);
  }
};
