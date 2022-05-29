import logger from './logger';
import mongoose from 'mongoose';
import IEnvironment from 'interfaces/environment';

export default async function initDatabase(environment: IEnvironment) {
  try {
    await mongoose.connect(environment.MongoUri);

    logger.info('Connected successfully to mongodb server');
  } catch (err) {
    logger.info('Cant connect to mongodb', err);
    await mongoose.disconnect();
  }
}
