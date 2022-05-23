import { ICommand } from './../schemas/command.schema';
import { CacheType, CommandInteraction, MessageEmbed } from 'discord.js';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { SlashCommandBuilder } from '@discordjs/builders';
import { container } from 'tsyringe';
import ISlashCommandsService from 'interfaces/services/slash-commands';
import ICommandsRepository from 'interfaces/repositories/commands';
import SlashCommand from 'models/slash-command';
import { Tokens } from './../utils/loadContainer';
import { getImage } from 'utils/scrapers/google-images';
import logger from 'utils/logger';
import Assets from '../utils/assets';
export default class ImagesSlashCommand extends SlashCommand {
  private myInstanstsRepository: ICommandsRepository = container.resolve<ICommandsRepository>(Tokens.ICommandsRepository);
  private slashCommandsService: ISlashCommandsService = container.resolve<ISlashCommandsService>(Tokens.ISlashCommandsService);

  constructor() {
    super('img', 'search an image on Google Images or create custom commands with images');
  }

  getSlashCommandJson(): RESTPostAPIApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(search =>
        search
          .setName('search')
          .setDescription('create a custom command that returns an image')
          .addStringOption(query =>
            query
              .setName('query')
              .setDescription('what you want to search for?')
              .setRequired(true),
          ),
      )
      .addSubcommand(create =>
        create
          .setName('create')
          .setDescription('create a custom command that returns an image')
          .addStringOption(name =>
            name
              .setName('name')
              .setDescription('command name')
              .setRequired(true),
          )
          .addStringOption(url =>
            url
              .setName('url')
              .setDescription('image url')
              .setRequired(true),
          )
          .addStringOption(description =>
            description
              .setName('description')
              .setDescription('image description')
              .setRequired(true),
          ),
      )
      .addSubcommand(edit =>
        edit
          .setName('edit')
          .setDescription('edit a custom command that returns an image')
          .addStringOption(name =>
            name
              .setName('name')
              .setDescription('command name')
              .setRequired(true),
          )
          .addStringOption(url =>
            url
              .setName('url')
              .setDescription('image url')
              .setRequired(true),
          )
          .addStringOption(description =>
            description
              .setName('description')
              .setDescription('image description')
              .setRequired(true),
          ),
      )
      .addSubcommand(del =>
        del
          .setName('delete')
          .setDescription('delete a custom command that returns an image')
          .addStringOption(name =>
            name
              .setName('name')
              .setDescription('command name')
              .setRequired(true),
          ),
      )
      .addSubcommand(list =>
        list
          .setName('list')
          .setDescription('list custom image commands'),
      )
      .toJSON();
  }

  private getActions = (): Map<string, (interaction: CommandInteraction<CacheType>) => Promise<void>> => {
    const actions = new Map<string, (actionInteraction: CommandInteraction<CacheType>) => Promise<void>>();
    actions.set('search', this.handleSearch);
    actions.set('create', this.handleCreate);
    actions.set('edit', this.handleEdit);
    actions.set('delete', this.handleDelete);
    actions.set('list', this.handleList);

    return actions;
  };

  async handle(interaction: CommandInteraction<CacheType>): Promise<void> {
    await interaction.deferReply();
    const actions = this.getActions();

    const subcommandName = interaction.options.getSubcommand();
    const action = actions.get(subcommandName);

    if (!action) {
      logger.info(`subcommand '${subcommandName}' not found`);
      await interaction.editReply(`ocorreu um erro ao processar esse comando`);
      return;
    }

    await action(interaction);
  }

  handleSearch = async (interaction: CommandInteraction<CacheType>) => {
    const query = interaction.options.getString('query', true);

    if (!query) return;

    const imageUri = await getImage(query);

    if (!imageUri) {
      await interaction.editReply('nenhuma imagem encontrada');
      return;
    }

    interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setImage(imageUri)
          .setURL(imageUri),
      ],
    });
  };

  handleCreate = async (interaction: CommandInteraction<CacheType>) => {
    const commandName = interaction.options.getString('name', true);
    const commandDescription = interaction.options.getString('description', true);
    const url = interaction.options.getString('url', true);

    let commandCreationError = await this.myInstanstsRepository.createServerCommand(
      interaction.guildId as string,
      commandName,
      url,
      'img',
    );

    if (commandCreationError) {
      logger.info(`there was an erro while creating a custom img command: ${commandCreationError}`);
      await interaction.editReply('não foi possível criar esse comando');
      return;
    }

    commandCreationError = await this.slashCommandsService.createInstantSlashCommand(
      interaction.guildId as string,
      interaction.guild?.name as string,
      commandName,
      commandDescription,
    );

    if (commandCreationError) {
      await interaction.editReply('não foi possível criar esse comando');
      return;
    }

    logger.info(`img custom command ${commandName} created on server '${interaction.guild?.name}'(${interaction.guildId})`);
    await interaction.editReply('comando criado com sucesso');
  };

  handleEdit = async (interaction: CommandInteraction<CacheType>) => {
    const commandName = interaction.options.getString('name', true);
    const commandDescription = interaction.options.getString('description', true);
    const url = interaction.options.getString('url', true);

    let commandEditError = await this.myInstanstsRepository.editServerCommand(
      interaction.guildId as string,
      commandName,
      url,
      'img',
    );

    if (commandEditError) {
      logger.info(`there was an erro while editing a custom img command: ${commandEditError}`);
      await interaction.editReply('não foi possível criar esse comando');
      return;
    }

    commandEditError = await this.slashCommandsService.createInstantSlashCommand(
      interaction.guildId as string,
      interaction.guild?.name as string,
      commandName,
      commandDescription,
    );

    if (commandEditError) {
      await interaction.editReply('não foi possível editar esse comando');
      return;
    }

    logger.info(`img custom command ${commandName} edited on server '${interaction.guild?.name}'(${interaction.guildId})`);
    await interaction.editReply('comando editado com sucesso');
  };

  handleDelete = async (interaction: CommandInteraction<CacheType>) => {
    const commandName = interaction.options.getString('name', true);

    let commandDeleteError = await this.myInstanstsRepository.deleteServerCommand(
      interaction.guildId as string,
      commandName,
    );

    if (commandDeleteError) {
      logger.info(`there was an erro while deleting a custom img command: ${commandDeleteError}`);
      await interaction.editReply('não foi possível remover esse comando');
      return;
    }

    commandDeleteError = await this.slashCommandsService.deleteInstantSlashCommand(
      interaction.guildId as string,
      interaction.guild?.name as string,
      commandName,
    );

    if (commandDeleteError) {
      await interaction.editReply('não foi possível remover esse comando');
      return;
    }

    logger.info(`img custom command ${commandName} removed on server '${interaction.guild?.name}'(${interaction.guildId})`);
    await interaction.editReply('comando removido com sucesso');
  };

  handleList = async (interaction: CommandInteraction<CacheType>) => {
    const server = await this.myInstanstsRepository.getServer(interaction.guildId as string);

    if (!server?.commands?.length) {
      logger.info(`server '${interaction.guild?.name}' not found`);
      interaction.editReply('não foi possível listar os comandos');
      return;
    }

    const commandDb = await this.myInstanstsRepository.getCommands(server, 'img');
    const commands = commandDb.map(c =>
      ({
        name:`/${c.alias}`,
        value: c.value,
      }));

    const embed = new MessageEmbed()
      .setTitle('Lista de comandos customizados (imagem)')
      .setColor('AQUA')
      .addFields(commands)
      .setThumbnail(Assets.macacoSpin);

    interaction.editReply({
      embeds: [
        embed,
      ],
    });
  };

  handleCustomCommand = async (interaction: CommandInteraction<CacheType>, command: ICommand) => {
    interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setImage(command.value as string),
      ],
    });
  };
}
