// ===== Global Middleware ===== //
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

// ===== Middleware Config ===== //
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again after 1 minute',
});

export { helmet, morgan, cors, compression, limiter };
