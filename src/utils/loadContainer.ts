import { container } from 'tsyringe';
import CommandsRepository from '../repositories/commands.repository';
import MyInstantsSlashCommand from '../slash-commands/inst';
import ImageSlashCommand from '../slash-commands/img';
import SlashCommandsService from '../services/slash-commands.service';
import CustomCommandsService from 'services/custom-command.service';
import IEnvironment from 'interfaces/environment';

export const Tokens = {
  IEnvironment: Symbol(),
  ICommandsRepository: Symbol(),
  ISlashCommandsService: Symbol(),
  ICustomCommandsService: Symbol(),
  MyInstantsSlashCommand: Symbol(),
  ImageSlashCommand: Symbol(),
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
  container.register(Tokens.ICommandsRepository, CommandsRepository);

  // services
  container.register(Tokens.ISlashCommandsService, SlashCommandsService);
  container.register(Tokens.ICustomCommandsService, CustomCommandsService);

  // commands
  container.register(Tokens.MyInstantsSlashCommand, MyInstantsSlashCommand);
  container.register(Tokens.ImageSlashCommand, ImageSlashCommand);
}

function validateRequiredEnvironmentVariables() {
  const requiredEnvVariables = ['BOT_TOKEN', 'BOT_CLIENTID', 'MONGO_URI'];

  for (let index = 0; index < requiredEnvVariables.length; index++) {
    const envVar = requiredEnvVariables[index];
    if (!(envVar in process.env)) {
      throw new Error(`Required environment variable '${envVar}' not found`);
    }
  }
}
