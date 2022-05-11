import IMyInstantsRepository from 'interfaces/repositories/my-instants';
import 'reflect-metadata';
import { container } from 'tsyringe';
import { Client } from 'discord.js';

import dotenv from 'dotenv';
dotenv.config();

import './utils/startDb.ts';
import './utils/loadContainer';

import logger from './utils/logger';
import MyInstantsSlashCommand from 'slash-commands/inst';
import { Types } from './utils/loadContainer';
import ISlashCommandsService from 'interfaces/services/slash-commands';
const { BOT_TOKEN: token } = process.env;

const slashCommandService = container.resolve<ISlashCommandsService>(Types.ISlashCommandsService);
slashCommandService.loadCommands();

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'],
  restTimeOffset: 25,
});

client.login(token);

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = slashCommandService.getCommand(interaction.commandName);

  if (command) {
    await command.handle(interaction, client);
  } else {
    const myInstantsRepository = container.resolve<IMyInstantsRepository>(
      Types.IMyInstantsRepository,
    );
    new MyInstantsSlashCommand(myInstantsRepository).handleCustomCommand(
      interaction,
    );
  }
});

client.once('ready', () => {
  client?.user?.setActivity('.help', {
    type: 'STREAMING',
    url: 'http://twitch.tv/tetistiger',
  });

  logger.info('EAE MACACO!');
});
