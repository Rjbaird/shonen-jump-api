import { Request, Response } from 'express';
import { getWelcomMessage } from '../services/health.services';
import { internalError } from '../utils';

export const sendHealthCheck = (req: Request, res: Response) => {
  const welcomeMessage = getWelcomMessage();
  try {
    return res.status(200).json(welcomeMessage);
  } catch (error) {
    return res.status(500).json(internalError(error, 'Error finding manga in database...'));
  }
};
