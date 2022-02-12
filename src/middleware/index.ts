// ===== Global Middleware ===== //
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

// ===== Middleware Config ===== //
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many accounts created from this IP, please try again after 15 minutes',
});

export { helmet, morgan, cors, compression, limiter };
