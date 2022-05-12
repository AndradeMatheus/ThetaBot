import Assets from '../utils/assets';
import { SlashCommandBuilder } from '@discordjs/builders';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import {
  BaseCommandInteraction,
  CacheType,
  Client,
  MessageEmbed,
} from 'discord.js';
import SlashCommand, { CommandHandlerType } from 'models/slash-command';

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

  async handle(
    interaction: BaseCommandInteraction<CacheType>,
    commandArg: CommandHandlerType,
  ): Promise<void> {
    const client = commandArg as Extract<CommandHandlerType, Client>;
    const guilds = {
      list: '- ' + client?.guilds.cache.map((g) => g.name).join('\n- '),
      count: client?.guilds.cache.size,
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
