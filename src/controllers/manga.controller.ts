import logger from '../logger';
import { Request, Response } from 'express';
import { findManga, scrapeMangaList, createCompleteManga, createManga, updateManga } from '../services/manga.services';

import { internalError } from '../utils';

export const getManga = async (req: Request, res: Response) => {
  const { mangaID } = req.params;
  try {
    const results = await findManga(mangaID);
    if (!results) {
      return res.status(404).json({
        data: `${mangaID} not found in database... Please verify you have the correct mangaID as a parameter or contact dev.`,
      });
    }
    return res.status(200).json({
      data: results,
    });
  } catch (error) {
    return res.status(500).json(internalError(error, 'Error finding manga in database...'));
  }
};

export const updateAllManga = async (req: Request, res: Response) => {
  const secretKey = req.headers.authorization;
  const adminKey = process.env.ADMIN_KEY as string;
  if (secretKey !== adminKey) {
    return res.status(401).json({
      data: `You are not authorized to updateAllManga in database...`,
    });
  }
  try {
    // TODO: Pull data from Redis not scrape
    const allManga = await scrapeMangaList();
    for (const manga of allManga) {
      logger.info(`Checking database for ${manga.mangaID}`);
      const completeManga = await createCompleteManga(manga.mangaID);
      if (completeManga) {
        updateManga(manga.mangaID, completeManga);
        // return res.status(201).json({
        //   msg: `${manga.mangaID} document updated in MongoDB`,
        //   data: completeManga,
        // });
      }
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      await delay(4500);
    }
    return res.status(201).json({
      data: 'All manga updated!!',
    });
  } catch (error) {
    return res.status(500).json(internalError(error, 'Error running updateAllManga '));
  }
};

export const createOneManga = async (req: Request, res: Response) => {
  const { mangaID } = req.params;
  const secretKey = req.headers.authorization;
  const adminKey = process.env.ADMIN_KEY as string;
  if (secretKey !== adminKey) {
    return res.status(401).json({
      data: `You are not authorized to add ${mangaID} to database...`,
    });
  }
  try {
    if (await findManga(mangaID)) {
      return res.status(200).json({
        data: `${mangaID} already in database...`,
      });
    }
    const completeManga = await createCompleteManga(mangaID);
    if (completeManga) {
      createManga(completeManga);
      return res.status(201).json({
        msg: `${mangaID} document added to MongoDB`,
        data: completeManga,
      });
    }
  } catch (error) {
    return res.status(500).json(internalError(error, `Error adding ${mangaID} to database...`));
  }
};

export const updateOneManga = async (req: Request, res: Response) => {
  const { mangaID } = req.params;
  const secretKey = req.headers.authorization;
  const adminKey = process.env.ADMIN_KEY as string;
  if (secretKey !== adminKey) {
    return res.status(401).json({
      data: `You are not authorized to update ${mangaID}  document in database...`,
    });
  }
  try {
    const completeManga = await createCompleteManga(mangaID);
    if (completeManga) {
      updateManga(mangaID, completeManga);
      return res.status(201).json({
        msg: `${mangaID} document updated in MongoDB`,
        data: completeManga,
      });
    }
  } catch (error) {
    return res.status(500).json(internalError(error, `Error updating ${mangaID} to database...`));
  }
};
