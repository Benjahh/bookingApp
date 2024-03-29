import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
export const dbclient = new Client(process.env.DB_CONFIG);

export const handleDBConnection = async () => {
  try {
    await dbclient.connect();
    console.log('Connected to DB');
  } catch (error) {
    console.log(error);
    console.log(error.message);
  }
};
