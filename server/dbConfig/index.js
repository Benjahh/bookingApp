import * as pg from 'pg';
const { Client } = pg;
const client = new Client(process.env.DB_CONFIG);

export const handleDBConnection = async () => {
  try {
    client.connect();
    console.log('Connected to DB');
  } catch (error) {
    console.log(error.message);
  }
};
