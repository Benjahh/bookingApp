import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morganBody from 'morgan-body';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { router } from './routes/index.js';
import { handleDBConnection } from './dbConfig/index.js';

dotenv.config();

const port = process.env.PORT ?? 3001;
const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
morganBody(app);

app.use(router);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});

await handleDBConnection();
