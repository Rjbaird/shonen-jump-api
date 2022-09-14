import 'dotenv/config';
import express, { Express } from 'express';
import logger from './logger';
import routes from './routes/routes';

// Basic Server Setup
const PORT = process.env.PORT || 8000;
const app: Express = express();

import { connect } from './db/connect';
import { compression, cors, helmet, limiter, morgan } from './middleware';

// Install Global Middlewawre
app.use([
  express.urlencoded({ extended: true }),
  express.json({ limit: '10kb' }),
  helmet(),
  morgan('dev'),
  cors(),
  limiter,
  compression(),
]);

// Start server
app.listen(PORT, async () => {
  logger.info(`--->>> Server is running on http://localhost:${PORT}`);
  // Connect to MongoDB
  // await connect();
  // Connect to routes
  routes(app);
});
