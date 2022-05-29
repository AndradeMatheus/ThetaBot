import { CommandInteraction, MessageEmbed } from 'discord.js';
import Assets from '../utils/assets';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import SlashCommand from 'models/slash-command';
import { SlashCommandBuilder } from '@discordjs/builders';

export default class AguSlashCommand extends SlashCommand {
  constructor() {
    super('agu', 'Exibe retrato verossímil de Lucão e Ninext');
  }

  getSlashCommandJson(): RESTPostAPIApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .toJSON();
  }

  async handle(interaction: CommandInteraction): Promise<void> {
    await interaction.reply({
      embeds: [
        new MessageEmbed({
          description: 'Lucão e Ninext',
          image: {
            url: Assets.lucasNinext,
          },
        }),
      ],
    });
  }
}
