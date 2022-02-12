import { Express, Request, Response } from 'express';
import logger from './logger';

import { getOneManga } from './db/connect';
import { mangaList, chapterSchedule, welcomeMessage } from './db/memory';

export default function (app: Express) {
  app.get('/', (req: Request, res: Response) => {
    try {
      res.send(welcomeMessage);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  app.get('/manga', async (req: Request, res: Response) => {
    try {
      res.send(mangaList);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  app.get('/schedule', async (req: Request, res: Response) => {
    try {
      res.send(chapterSchedule);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  app.get('/manga/:mangaID', async (req: Request<{ mangaID: 'string' }>, res: Response) => {
    try {
      const { mangaID } = req.params;
      getOneManga(mangaID)
        .then(response => {
          return res.send(response);
        })
        .catch(error => logger.info(error));
    } catch (error) {
      return res.status(500).send(error);
    }
  });
}
