import logger from '../logger';

import { createClient } from 'redis';
import { scrapeMangaList } from '../services/manga.services';

export const connectToRedis = async () => {
  try {
    const redisUri = process.env.REDIS_URI as string;
    const redisClient = createClient({ url: redisUri });
    await redisClient.connect();
    redisClient.on('error', err => logger.error('Redis Client Error', err));
    const list = await scrapeMangaList();
    redisClient.SET('mangaList', JSON.stringify(list));
    logger.info('mangaList updated in Redis!');
  } catch (error) {
    logger.error('Error connecting to database...', error);
  }
};

export const getMangaList = async () => {
  try {
    const redisUri = process.env.REDIS_URI as string;
    const redisClient = createClient({ url: redisUri });
    await redisClient.connect();
    redisClient.on('error', err => logger.error('Redis Client Error', err));
    const mangaList = (await redisClient.GET('mangaList')) as string;
    const results = { data: JSON.parse(mangaList) };
    return results;
  } catch (error) {
    console.error('Error getting mangaList from Redis database...', error);
  }
};
