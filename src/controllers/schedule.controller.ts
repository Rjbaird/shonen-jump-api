import logger from '../logger';
import { Request, Response } from 'express';
import { Schedule } from '../models/schedule.model';
import { currentUnixDate, internalError } from '../utils';
import { getUpcomingReleases, clearScheduleDB, updateScheduleDB } from '../services/schedule.services';

import { createClient } from 'redis';
const redisUri = process.env.REDIS_URI as string;
const redisClient = createClient({ url: redisUri });

// COMPLETE
export const updateReleaseSchedule = async (req: Request, res: Response) => {
  const today = currentUnixDate();
  const secretKey = req.headers.authorization;
  const adminKey = process.env.ADMIN_KEY as string;
  if (secretKey !== adminKey) {
    return res.status(401).json({
      data: `You are not authorized to update schedule in database...`,
    });
  }
  try {
    const upcomingSchedule = await getUpcomingReleases(today);
    await clearScheduleDB();
    await updateScheduleDB(upcomingSchedule);
    logger.info('Schedule collection updated');
    return res.status(200).json({
      data: 'Schedule collection updated',
    });
  } catch (error) {
    return res.status(500).json(internalError(error, 'Error updating schedule in database..'));
  }
};

// TODO: Move database call to services and add redis caching
export const getReleaseSchedule = async (req: Request, res: Response) => {
  // const redisClient = createClient();
  try {
    const results = await Schedule.find({}, { _id: 0, _v: 0 }).exec();
    // redisClient.setEx('schedule', 3600, JSON.stringify(results));
    return res.status(200).json({
      data: results,
    });
  } catch (error) {
    return res.status(500).json(internalError(error, 'Error getting schedule from database..'));
  }
};
