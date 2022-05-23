import { CacheType, CommandInteraction, MessageEmbed } from 'discord.js';
import Assets from '../utils/assets';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import SlashCommand from 'models/slash-command';
import { SlashCommandBuilder } from '@discordjs/builders';

export default class InfoSlashCommand extends SlashCommand {
  constructor() {
    super('info', 'you know, important stuff');
  }

  getSlashCommandJson(): RESTPostAPIApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand((list) =>
        list
          .setName('list-servers')
          .setDescription('list servers using Thetabot'),
      )
      .toJSON();
  }

  async handle(interaction: CommandInteraction<CacheType>): Promise<void> {
    const guilds = {
      list:
        '- ' + interaction.client?.guilds.cache.map((g) => g.name).join('\n- '),
      count: interaction.client?.guilds.cache.size,
    };

    const serverlist = new MessageEmbed()
      .setTitle(`Estou em ${guilds.count} servidores:`)
      .setColor('BLURPLE')
      .setDescription(guilds.list)
      .setThumbnail(Assets.macacoSurpreso)
      .setFooter({
        text: `Me convide para o seu servidor!\n${Assets.theta.inviteShort}`,
      });

    interaction?.reply({ embeds: [serverlist] });
  }
}
