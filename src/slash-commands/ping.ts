import { CommandInteraction } from 'discord.js';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/rest/v10/interactions';
import SlashCommand from 'models/slash-command';
import { SlashCommandBuilder } from '@discordjs/builders';

export default class PingSlashCommand extends SlashCommand {
  constructor() {
    super('ping', 'ping-pong');
  }

  getSlashCommandJson(): RESTPostAPIApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName('ping')
      .setDescription('you say ping, i say pong')
      .toJSON();
  }

  async handle(interaction: CommandInteraction): Promise<void> {
    await interaction.reply('PONG KRL');
  }
}
