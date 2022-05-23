import { CommandInteraction, MessageEmbed } from 'discord.js';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import Assets from '../utils/assets';
import IMyInstantResponse from 'interfaces/responses/IMyInstantResponse';
import ICommandsRepository from '../interfaces/repositories/commands';
import SlashCommand from 'models/slash-command';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Tokens } from '../utils/loadContainer';
import axios from 'axios';
import { container } from 'tsyringe';
import logger from '../utils/logger';
import ISlashCommandsService from 'interfaces/services/slash-commands';
import { ICommand } from 'schemas/command.schema';

type CommandDataType = {
  commandName: string;
  commandValue: string;
  commandDescription: string;
};

export default class MyInstantsSlashCommand extends SlashCommand {
  private myInstantsRepository = container.resolve<ICommandsRepository>(
    Tokens.ICommandsRepository,
  );
  private slashCommandsService = container.resolve<ISlashCommandsService>(
    Tokens.ISlashCommandsService,
  );

  constructor() {
    super('inst', 'MyInstants commands');
  }

  getSlashCommandJson(): RESTPostAPIApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand((play) =>
        play
          .setName('play')
          .setDescription('play a MyInstant audio by name/url')
          .addStringOption((opt) =>
            opt
              .setName('value')
              .setDescription('MyInstant audio name or full url')
              .setRequired(true),
          ),
      )
      .addSubcommand((create) =>
        create
          .setName('create')
          .setDescription('create a custom MyInstant command')
          .addStringOption((name) =>
            name
              .setName('name')
              .setDescription('command name')
              .setRequired(true),
          )
          .addStringOption((value) =>
            value
              .setName('value')
              .setDescription("MyInstant' name/url that will be played")
              .setRequired(true),
          )
          .addStringOption((description) =>
            description
              .setName('description')
              .setDescription('audio description')
              .setRequired(true),
          ),
      )
      .addSubcommand((edit) =>
        edit
          .setName('edit')
          .setDescription('edit a custom MyInstant command')
          .addStringOption((name) =>
            name
              .setName('name')
              .setDescription('command name')
              .setRequired(true),
          )
          .addStringOption((value) =>
            value
              .setName('value')
              .setDescription("MyInstant' name/url that will be played")
              .setRequired(true),
          )
          .addStringOption((description) =>
            description
              .setName('description')
              .setDescription('audio description')
              .setRequired(true),
          ),
      )
      .addSubcommand((del) =>
        del
          .setName('delete')
          .setDescription('delete a custom MyInstant command')
          .addStringOption((name) =>
            name
              .setName('name')
              .setDescription('command name')
              .setRequired(true),
          ),
      )
      .addSubcommand((list) =>
        list.setName('list').setDescription('list MyInstant custom commands'),
      )
      .toJSON();
  }

  private async getMyInstants(
    search: string,
  ): Promise<IMyInstantResponse | null> {
    const query = search.replace(/ /g, '-');
    try {
      const response = await axios.get<IMyInstantResponse>(
        `https://www.myinstants.com/api/v1/instants/${query}`,
      );

      return response.data;
    } catch (err: any) {
      logger.error(
        `there was an error while searching myinstant '${query}': ${err.message}`,
      );
      return null;
    }
  }

  handle = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();
    const subCommandName = interaction.options.getSubcommand();
    const subcommands = new Map<
      string,
      (fnInteraction: CommandInteraction) => Promise<void>
    >();
    subcommands.set('play', this.handlePlay);
    subcommands.set('create', this.handleCreate);
    subcommands.set('edit', this.handleEdit);
    subcommands.set('delete', this.handleDelete);
    subcommands.set('list', this.handleList);

    const action = subcommands.get(subCommandName);

    if (!action) {
      await interaction.editReply('comando não encontrado');
      logger.alert(`subcommand /${this.name} ${subCommandName} not found`);
      return;
    }

    await action(interaction);
  };

  handlePlay = async (interaction: CommandInteraction) => {
    const option = interaction.options.get('value');
    const instantSearch = this.extractSearch(option?.value as string);

    await this.handleInstantPlay(interaction, instantSearch);
    await interaction.editReply('done');
  };

  private handleInstantPlay = async (
    interaction: CommandInteraction,
    instantSearch: string,
  ) => {
    const instant = await this.getMyInstants(instantSearch);

    if (!instant?.sound) {
      interaction.editReply('instant not found');
      return;
    }

    const connection = await this.getVoiceChannelConnection(interaction);

    if (!connection) {
      interaction.editReply('voice channel not found');
      return;
    }

    await this.connectToVoiceChannelAndPlay(connection, instant.sound);

    const FIVE_MINUTES_IN_MILISECONDS = 5 * 60 * 1000;
    setTimeout(() => connection.disconnect(), FIVE_MINUTES_IN_MILISECONDS);
  };

  handleCreate = async (interaction: CommandInteraction) => {
    const { commandName, commandDescription, commandValue } =
      this.getCommandData(interaction);

    const commandCreationError =
      await this.myInstantsRepository.createServerCommand(
        interaction.guildId as string,
        commandName,
        commandValue,
        'inst',
      );

    if (commandCreationError) {
      logger.info(
        `the was an error while creating command ${commandName} on server '${interaction.guild?.name}': ${commandCreationError}`,
      );
      await interaction.editReply('ocorreu um erro ao criar esse comando');
      return;
    }

    await this.createInstantSlashCommand(
      interaction,
      commandName,
      commandDescription,
    );

    logger.info(
      `command '${commandName}' created successfully on server '${interaction.guild?.name}'`,
    );
    await interaction.editReply(`comando '${commandName}' criado com sucesso`);
  };

  handleEdit = async (interaction: CommandInteraction) => {
    const { commandName, commandValue, commandDescription } =
      this.getCommandData(interaction);
    const instant = await this.getMyInstants(commandValue);

    if (!instant?.sound) {
      interaction.editReply('MyInstant não encontrado');
      return;
    }

    let commandUpdateError = await this.myInstantsRepository.editServerCommand(
      interaction.guildId as string,
      commandName,
      commandValue,
      'inst',
    );

    if (commandUpdateError) {
      await interaction.editReply('ocorreu um erro ao editar esse comando');
      logger.info(
        `there was an error to edit command '${commandName}' on server ${interaction.guild?.name} (${interaction.guild}))`,
      );

      return;
    }

    commandUpdateError = await this.createInstantSlashCommand(
      interaction,
      commandName,
      commandDescription,
    );

    if (commandUpdateError) {
      await interaction.editReply('ocorreu um erro ao editar esse comando');
      return;
    }

    logger.info(
      `Command '${commandName}' edited on server '${interaction.guild?.name}(${interaction.guildId})'`,
    );
    await interaction.editReply(
      `comando '${commandName}' alterado com sucesso`,
    );
  };

  handleDelete = async (interaction: CommandInteraction) => {
    const nameOption = interaction.options.get('name', true);
    const name = nameOption?.value as string;

    let commandDeleteError =
      await this.myInstantsRepository.deleteServerCommand(
        interaction.guildId as string,
        name as string,
      );

    if (commandDeleteError) {
      interaction.editReply('ocorreu um erro ao remover esse comando');
      logger.info(
        `There an error while trying to delete command '${name}'from server '${interaction.guild?.name}(${interaction.guildId})'`,
      );
      return;
    }

    commandDeleteError = await this.deleteInstantSlashCommand(
      interaction,
      name,
    );

    if (commandDeleteError) {
      interaction.editReply('ocorreu um erro ao remover esse comando');
      return;
    }

    logger.info(
      `Command '${name}' deleted from server '${interaction.guild?.name}(${interaction.guildId})'`,
    );
    await interaction.editReply(`comando '${name}' removido com sucesso`);
  };

  handleList = async (interaction: CommandInteraction) => {
    const server = await this.myInstantsRepository.getServer(
      interaction.guildId as string,
    );

    if (!server?.commands?.length) {
      logger.info(`server '${interaction.guild?.name}' not found`);
      interaction.editReply('não foi possível listar os comandos');
      return;
    }

    const commandDb = await this.myInstantsRepository.getCommands(
      server,
      'inst',
    );
    const commands = commandDb.map((c) => ({
      name: `/${c.alias}`,
      value: c.value,
    }));

    const embed = new MessageEmbed()
      .setTitle('Lista de comandos customizados (MyInstants)')
      .setColor('BLUE')
      .addFields(commands)
      .setThumbnail(Assets.macacoSpin);

    interaction.editReply({
      embeds: [embed],
    });
  };

  private getCommandData = (
    interaction: CommandInteraction,
  ): CommandDataType => {
    const commandName = interaction.options.getString('name', true);
    const commandValue = interaction.options.getString('value', true);
    const commandDescription = interaction.options.getString(
      'description',
      true,
    );

    return {
      commandName,
      commandValue,
      commandDescription,
    };
  };

  handleCustomCommand = async (
    interaction: CommandInteraction,
    command: ICommand,
  ) => {
    await this.handleInstantPlay(interaction, command.value);
    await interaction.editReply('done');
  };

  private createInstantSlashCommand = async (
    interaction: CommandInteraction,
    commandName: string,
    commandDescription: string,
  ): Promise<string | undefined> => {
    const commandCreationError =
      await this.slashCommandsService.createInstantSlashCommand(
        interaction.guildId as string,
        interaction.guild?.name as string,
        commandName,
        commandDescription,
      );

    if (commandCreationError) {
      return commandCreationError;
    }
  };

  private deleteInstantSlashCommand = async (
    interaction: CommandInteraction,
    commandName: string,
  ): Promise<string | undefined> => {
    const commandDeletionError =
      await this.slashCommandsService.deleteInstantSlashCommand(
        interaction.guildId as string,
        interaction.guild?.name as string,
        commandName,
      );

    if (commandDeletionError) {
      return commandDeletionError;
    }
  };

  private extractSearch = (input: string): string => {
    const search = input.includes('myinstants.com')
      ? input
          .replace('https://', '')
          .replace('http://', '')
          .replace('www.', '')
          .replace('myinstants.com/instant/', '')
          .replace('/', '')
      : input.replace('/', '');

    return search;
  };
}
