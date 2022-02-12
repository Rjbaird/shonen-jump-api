import express, { Express } from 'express';
import logger from './logger';
import routes from './routes';

// Basic Server Setup
const PORT = process.env.PORT || 8000;
const app: Express = express();

import { getUpcomingReleases, getAllManga } from './db/connect';
import { currentUnixDate } from './utils';
import { helmet, morgan, cors, compression, limiter } from './middleware';

// Documentation Tools
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

// Install Global Middleware
app.use([
  express.urlencoded({ extended: false }),
  express.json(),
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
      description: 'An API showing data about English releases from Weekly Shonen Jump',
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

// Update memory on server start
getAllManga();
getUpcomingReleases(currentUnixDate());

app.listen(PORT, async () => {
  logger.info(`Server running at http://localhost:${PORT}`);
  routes(app);
});
