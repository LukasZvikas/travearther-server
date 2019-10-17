import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import { getConfig } from './config';
import { isAuth } from './services/isAuth';
import { isError } from './services/errorHandling';
import authRoutes from './routes/authRoutes';
import dealRoutes from './routes/dealRoutes';
import businessRoutes from './routes/businessRoutes';

const keys = getConfig();

mongoose.connect(keys.MONGO_KEY);

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(isAuth);

authRoutes(app);
dealRoutes(app);
businessRoutes(app);

app.use(isError);

const PORT = process.env.PORT || 9000;

app.listen(PORT, () =>
  console.log(`Listening to ${process.env.NODE_ENV}: ${PORT}`)
);

export default app;
