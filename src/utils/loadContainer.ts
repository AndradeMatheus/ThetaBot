import MyInstantsRepository from '../repositories/myinstants.repository';
import MyInstantsSlashCommand from 'slash-commands/inst';
import SlashCommandsService from 'services/slash-commands.service';
import { container } from 'tsyringe';

export const Types = {
  IMyInstantsRepository: Symbol(),
  ISlashCommandsService: Symbol(),
  MyInstantsSlashCommand: Symbol(),
};

// repositories
container.register(Types.IMyInstantsRepository, MyInstantsRepository);

// services
container.register(Types.ISlashCommandsService, SlashCommandsService);

// commands
container.register(Types.MyInstantsSlashCommand, MyInstantsSlashCommand);
