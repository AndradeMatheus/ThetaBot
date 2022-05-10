import { Client } from 'discord.js';

import dotenv from 'dotenv';
dotenv.config();

import './utils/startDb.ts';
import logger from './utils/logger';
import SlashCommandsService from 'services/slash-commands.service';
import MyInstantsSlashCommand from 'slash-commands/inst';
const { BOT_TOKEN: token } = process.env;

const slashCommandService = new SlashCommandsService();
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
    new MyInstantsSlashCommand().handleCustomCommand(interaction);
  }
});

client.once('ready', () => {
  client?.user?.setActivity('.help', {
    type: 'STREAMING',
    url: 'http://twitch.tv/tetistiger',
  });

  logger.info('EAE MACACO!');
});
