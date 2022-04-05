import express, { Express } from 'express';
import logger from './logger';
import routes from './routes/routes';
import 'dotenv/config';

// Basic Server Setup
const PORT = process.env.PORT || 8000;
const app: Express = express();

// Import Bree for database update cron jobs

import { connect } from './db/connect';
import { connectToRedis } from './db/redis';
import { helmet, morgan, cors, compression, limiter } from './middleware';

// Documentation Tools
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

// Install Global Middleware
app.use([
  express.urlencoded({ extended: true }),
  express.json({ limit: '10kb' }),
  helmet(),
  morgan('dev'),
  cors(),
  limiter,
  compression(),
]);

// Swagger Docs Automation
const swagOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shonen Jump API',
      version: '1.1.0',
      description: 'An API showing data about  releases from Weekly Shonen Jump',
    },
    contact: {
      name: 'Ryan Baird',
      url: 'https://ryanbaird.com/',
      email: 'rjbaird09@gmail.com',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./src/*.ts'],
};

const docSpecs = swaggerJsDoc(swagOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(docSpecs));

// Start server
app.listen(PORT, async () => {
  logger.info(`--->>> Server is running on http://localhost:${PORT}`);
  // Connect to MongoDB
  await connect();
  // Connect to Redis
  await connectToRedis();
  // Connect to routes
  routes(app);
});
