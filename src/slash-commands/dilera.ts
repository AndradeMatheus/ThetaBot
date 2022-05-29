import { CacheType, CommandInteraction } from 'discord.js';
import Assets from '../utils/assets';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import SlashCommand from 'models/slash-command';
import { SlashCommandBuilder } from '@discordjs/builders';

export default class DileraSlashCommand extends SlashCommand {
  constructor() {
    super('dilera', 'uh uh uh');
  }

  getSlashCommandJson(): RESTPostAPIApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .toJSON();
  }

  async handle(interaction: CommandInteraction<CacheType>): Promise<void> {
    const connection = await this.getVoiceChannelConnection(interaction);

    if (!connection) {
      interaction.reply({
        ephemeral: true,
        data: { content: "can't connect to voice channel" },
      });
      return;
    }

    await this.connectToVoiceChannelAndPlay(connection, Assets.dileraBuzina);
    await interaction.reply({ content: 'uh uh uhh', ephemeral: true });
  }
}
