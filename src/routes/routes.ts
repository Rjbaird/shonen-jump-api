import { Express, Request, Response } from 'express';
import logger from '../logger';

// NOTE: Import Controllers
import { sendHealthCheck } from '../controllers/health.controller';
import { updateReleaseSchedule, getReleaseSchedule } from '../controllers/schedule.controller';
import { getManga, createOneManga, updateAllManga, updateOneManga } from '../controllers/manga.controller';
import { getMangaList } from '../db/redis';

export default function (app: Express) {
  logger.info('Setting up routes');
  // ========== SECTION: GET REQUESTS ========== //

  // COMPLETE:
  // NOTE: Health Check & Welcome Message
  app.get('/', sendHealthCheck);

  // COMPLETE
  // NOTE: GET - Returns a list of all upcoming manga. Default sort starts with soonest release in alphabetical order
  app.get('/v1/schedule', getReleaseSchedule);

  // NOTE: GET - Returns a list of manga. Default sort is by most recent chapter release
  app.get('/v1/manga', async (req: Request, res: Response) => {
    try {
      // TODO: Add type to allManga
      // TODO: Cache allManga
      const allManga = await getMangaList();
      res.send(allManga);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  // COMPLETE
  // NOTE: GET - Returns data on a single manga
  app.get('/v1/manga/:mangaID', getManga);

  // ========== SECTION: POST REQUESTS ========== //
  // COMPLETE
  // NOTE: POST - Creates data on a single manga
  app.post('/v1/manga/:mangaID', createOneManga);

  // NOTE: POST - Update all  manga objects in database
  // TODO: Create Bree job to call updateAllManga
  app.post('/v1/allmanga/', updateAllManga);

  // ========== SECTION: PUT REQUESTS ========== //

  // COMPLETE
  // NOTE: POST - Updates schedule collection in database
  app.put('/v1/schedule', updateReleaseSchedule);

  // COMPLETE
  // NOTE: POST - Creates data on a single manga
  app.put('/v1/manga/:mangaID', updateOneManga);

  logger.info('Route set up complete');
}
