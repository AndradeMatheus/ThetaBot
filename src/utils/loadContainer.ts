import { container } from 'tsyringe';
import MyInstantsRepository from '../repositories/myinstants.repository';
import SlashCommandsService from 'services/slash-commands.service';

export const Types = {
  IMyInstantsRepository: Symbol(),
  ISlashCommandsService: Symbol(),
};

// repositories
container.register(Types.IMyInstantsRepository, MyInstantsRepository);

// services
container.register(Types.ISlashCommandsService, SlashCommandsService);
