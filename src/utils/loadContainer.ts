import { container } from 'tsyringe';
import MyInstantsRepository from '../repositories/myinstants.repository';
import MyInstantsSlashCommand from '../slash-commands/inst';
import SlashCommandsService from '../services/slash-commands.service';
import IEnvironment from 'interfaces/environment';

export const Tokens = {
  IEnvironment: Symbol(),
  IMyInstantsRepository: Symbol(),
  ISlashCommandsService: Symbol(),
  MyInstantsSlashCommand: Symbol(),
};

export default function loadDIContainer() {
  validateRequiredEnvironmentVariables();

  container.register<IEnvironment>(Tokens.IEnvironment, {
    useValue: {
      Token: process.env.BOT_TOKEN,
      ClientId: process.env.BOT_CLIENTID,
      MongoUri: process.env.MONGO_URI,
    } as IEnvironment,
  });

  // repositories
  container.register(Tokens.IMyInstantsRepository, MyInstantsRepository);

  // services
  container.register(Tokens.ISlashCommandsService, SlashCommandsService);

  // commands
  container.register(Tokens.MyInstantsSlashCommand, MyInstantsSlashCommand);
}

function validateRequiredEnvironmentVariables() {
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
