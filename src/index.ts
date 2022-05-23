import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import { Client } from 'discord.js';
import { container } from 'tsyringe';
import IEnvironment from 'interfaces/environment';
import initDatabase from './utils/database';
import loadDIContainer, { Tokens } from './utils/loadContainer';
import logger from './utils/logger';
import ISlashCommandsService from './interfaces/services/slash-commands';
import ICustomCommandsService from './interfaces/services/custom-command';
loadDIContainer();

const environment = container.resolve<IEnvironment>(Tokens.IEnvironment);

const slashCommandService = container.resolve<ISlashCommandsService>(
  Tokens.ISlashCommandsService,
);

initDatabase(environment);

slashCommandService.loadCommands();

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'],
  restTimeOffset: 25,
});

client.login(environment.Token);

client.once('ready', () => {
  client?.user?.setActivity({
    name: 'Thetabot',
    type: 'STREAMING',
    url: 'http://twitch.tv/tetistiger',
  });

  logger.info('EAE MACACO!');
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = slashCommandService.getCommand(interaction.commandName);

  if (command) {
    await command.handle(interaction);
  } else {
    const customCommandService = container.resolve<ICustomCommandsService>(
      Tokens.ICustomCommandsService,
    );
    customCommandService.handle(interaction);
  }
});
