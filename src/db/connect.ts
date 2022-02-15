import logger from '../logger';
import mongoose from 'mongoose';


// Connect to MongoDB
const connect = () => {
  const url: string = process.env.DB_URI as string;
  mongoose.connect(url);
  mongoose.connection.once('open', async () => {
    logger.info('Connected to database');
  });

  mongoose.connection.on('error', err => {
    logger.error('Error connecting to database  ', err);
  });
};

const disconnect = () => {
  if (!mongoose.connection) {
    return;
  }

  mongoose.disconnect();

  mongoose.connection.once('close', async () => {
    console.log('Diconnected  to database');
  });
};



export { connect, disconnect };
