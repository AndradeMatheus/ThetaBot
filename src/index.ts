import dotenv from 'dotenv';
dotenv.config();

// eslint-disable-next-line sort-imports
import 'reflect-metadata';
import './utils/startDb.ts';
import loadDIContainer, { Types } from './utils/loadContainer';
import { Client } from 'discord.js';
import ISlashCommandsService from './interfaces/services/slash-commands';
import MyInstantsSlashCommand from './slash-commands/inst';
import { container } from 'tsyringe';
import logger from './utils/logger';
loadDIContainer();

const { BOT_TOKEN: token } = process.env;

const slashCommandService = container.resolve<ISlashCommandsService>(
  Types.ISlashCommandsService,
);
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
    await command.handle(interaction);
  } else {
    const myInstantsSlashCommand = container.resolve<MyInstantsSlashCommand>(
      Types.MyInstantsSlashCommand,
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
