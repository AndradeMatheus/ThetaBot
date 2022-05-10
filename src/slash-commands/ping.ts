import { BaseCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import SlashCommand from 'models/slash-command';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/rest/v10/interactions';

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

  async handle(interaction: BaseCommandInteraction): Promise<void> {
    await interaction.reply('PONG KRL');
  }
}
