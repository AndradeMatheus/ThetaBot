import { CacheType, CommandInteraction, MessageEmbed } from 'discord.js';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import SlashCommand from 'models/slash-command';
import { SlashCommandBuilder } from '@discordjs/builders';
import { getImage } from 'utils/scrapers/google-images';

export default class GoogleImageScrapperSearchSlashCommand extends SlashCommand {
  constructor() {
    super('img', 'search an image on Google Images');
  }

  getSlashCommandJson(): RESTPostAPIApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((search) =>
        search
          .setName('search')
          .setDescription('what you want to search for?')
          .setRequired(true),
      )
      .toJSON();
  }

  async handle(interaction: CommandInteraction<CacheType>): Promise<void> {
    const search = interaction.options.get('search', true);

    if (!search?.value) return;

    const imageUri = await getImage(search.value as string);

    if (imageUri) {
      const embed = new MessageEmbed();
      embed.setImage(imageUri);
      embed.setURL(imageUri);
      interaction.reply({
        embeds: [embed],
      });
    }
  }
}
