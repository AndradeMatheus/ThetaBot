import logger from './logger';
import mongoose from 'mongoose';

const { MONGO_URI: mongoUri } = process.env;

async function run() {
  try {
    await mongoose.connect(mongoUri!);

    logger.info('Connected successfully to mongodb server');
  } catch (err) {
    logger.info('Cant connect to mongodb', err);
    await mongoose.disconnect();
  }
}

run().catch(console.dir);
