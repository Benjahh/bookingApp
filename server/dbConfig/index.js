import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
export const dbclient = new Pool({
  connectionString: process.env.DB_CONFIG,
});

export const handleDBConnection = async () => {
  try {
    if (!dbclient._connected) {
      await dbclient.connect();
      console.log('Connected to DB');
    } else {
      console.log('Already connected to DB');
    }
  } catch (error) {
    console.error('Error connecting to DB:', error);
    dbclient.end();
  }
};
