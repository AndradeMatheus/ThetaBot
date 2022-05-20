import { container } from 'tsyringe';
import MyInstantsRepository from '../repositories/myinstants.repository';
import MyInstantsSlashCommand from '../slash-commands/inst';
import SlashCommandsService from '../services/slash-commands.service';
import IEnvironment from 'interfaces/environment';

export const Types = {
  IEnvironment: Symbol(),
  IMyInstantsRepository: Symbol(),
  ISlashCommandsService: Symbol(),
  MyInstantsSlashCommand: Symbol(),
};

export default function loadDIContainer() {
  validateRequiredEnvironment();

  container.register<IEnvironment>(Types.IEnvironment, {
    useValue: {
      Token: process.env.BOT_TOKEN,
      ClientId: process.env.BOT_CLIENTID,
      MongoUri: process.env.MONGO_URI,
    } as IEnvironment,
  });

  // repositories
  container.register(Types.IMyInstantsRepository, MyInstantsRepository);

  // services
  container.register(Types.ISlashCommandsService, SlashCommandsService);

  // commands
  container.register(Types.MyInstantsSlashCommand, MyInstantsSlashCommand);
}

function validateRequiredEnvironment() {
  const requiredEnvVariables = [
    'BOT_TOKEN',
    'BOT_CLIENTID',
    'MONGO_URI',
  ];

  for (let index = 0; index < requiredEnvVariables.length; index++) {
    const envVar = requiredEnvVariables[index];
    if (!(envVar in process.env)) throw new Error(`Required environment variable '${envVar}' not found`);
  }
}
