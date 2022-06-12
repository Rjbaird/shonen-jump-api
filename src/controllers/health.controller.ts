import { Request, Response } from 'express';
import { getWelcomMessage } from '../services/health.services';

export const sendHealthCheck = (req: Request, res: Response) => {
  const welcomeMessage = getWelcomMessage();
  try {
    return res.status(200).json(welcomeMessage);
  } catch (error) {
    return res.status(500).send(error);
  }
};
