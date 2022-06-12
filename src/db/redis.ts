import logger from '../logger';
import { createClient } from 'redis';
import { scrapeMangaList } from '../services/manga.services';

export const connectToRedis = async () => {
    const redisHost = process.env.REDIS_HOST as string;
    const redisPort = process.env.REDIS_PORT as string;
    const redisPassword = process.env.REDIS_KEY as string;
    const redisClient = createClient({ url: `redis://default:${redisPassword}@${redisHost}:${redisPort}` });
    await redisClient.connect();
    redisClient.on('error', err => logger.error('Redis Client Error', err));
    console.log('Resting Manga List in Redis DB')
    const list = await scrapeMangaList();
    redisClient.SET('mangaList', JSON.stringify(list));
    logger.info('mangaList updated in Redis!');
};

export const getMangaList = async () => {
  try {
    const redisHost = process.env.REDIS_HOST as string;
    const redisPort = process.env.REDIS_PORT as string;
    const redisPassword = process.env.REDIS_KEY as string;
    const redisClient = createClient({ url: `redis://default:${redisPassword}@${redisHost}:${redisPort}` });
    await redisClient.connect();
    redisClient.on('error', err => logger.error('Redis Client Error', err));
    const mangaList = (await redisClient.GET('mangaList')) as string;
    const results = { data: JSON.parse(mangaList) };
    return results;
  } catch (error) {
    console.error('Error getting mangaList from Redis database...', error);
  }
};
