import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import IEnvironment from 'interfaces/environment';
import initDatabase from './utils/database';
import loadDIContainer, { Tokens } from './utils/loadContainer';
import { Client } from 'discord.js';
import ISlashCommandsService from './interfaces/services/slash-commands';
import MyInstantsSlashCommand from './slash-commands/inst';
import { container } from 'tsyringe';
import logger from './utils/logger';
loadDIContainer();

const environment = container.resolve<IEnvironment>(
  Tokens.IEnvironment,
);

initDatabase(environment);

const slashCommandService = container.resolve<ISlashCommandsService>(
  Tokens.ISlashCommandsService,
);
slashCommandService.loadCommands();

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'],
  restTimeOffset: 25,
});

client.login(environment.Token);

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = slashCommandService.getCommand(interaction.commandName);

  if (command) {
    await command.handle(interaction);
  } else {
    const myInstantsSlashCommand = container.resolve<MyInstantsSlashCommand>(
      Tokens.MyInstantsSlashCommand,
    );
    myInstantsSlashCommand.handleCustomCommand(interaction);
  }
});

client.once('ready', () => {
  client?.user?.setActivity('.help', {
    type: 'STREAMING',
    url: 'http://twitch.tv/tetistiger',
  });

  logger.info('EAE MACACO!');
});
