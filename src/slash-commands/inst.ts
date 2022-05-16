import { CommandInteraction, MessageEmbed } from 'discord.js';
import {
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from 'discord-api-types/v10';
import SlashCommand, { CommandHandlerType } from 'models/slash-command';
import Assets from '../utils/assets';
import IMyInstantResponse from 'interfaces/responses/IMyInstantResponse';
import IMyInstantsRepository from '../interfaces/repositories/my-instants';
import ISlashCommand from 'interfaces/ISlashCommand';
import { REST } from '@discordjs/rest';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Types } from '../utils/loadContainer';
import axios from 'axios';
import { container } from 'tsyringe';
import logger from '../utils/logger';

const { BOT_TOKEN, BOT_CLIENTID } = process.env;

type CommandDataType = {
  commandName: string;
  commandValue: string;
  commandDescription: string | undefined;
};

export default class MyInstantsSlashCommand extends SlashCommand {
  private myInstantsRepository = container.resolve<IMyInstantsRepository>(
    Types.IMyInstantsRepository,
  );

  constructor() {
    super(
      'inst',
      'MyInstants commands',
      '/inst {play | create | edit | delete}',
    );
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
              .setRequired(false),
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
              .setRequired(false),
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
        list
          .setName('list')
          .setDescription('list MyInstant custom commands'),
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

  handle = async (
    interaction: CommandInteraction,
    commandArgs: CommandHandlerType,
  ): Promise<void> => {
    await interaction.deferReply();
    const subCommandName = interaction.options.getSubcommand();
    const subcommands = new Map<
      string,
      (
        fnInteraction: CommandInteraction,
        fnCommandArgs: CommandHandlerType,
      ) => Promise<void>
    >();
    subcommands.set('play', this.handlePlay);
    subcommands.set('create', this.handleCreate);
    subcommands.set('edit', this.handleEdit);
    subcommands.set('delete', this.handleDelete);
    subcommands.set('list', this.handleList);

    if (!subcommands.has(subCommandName)) {
      await interaction.editReply(`invalid command '${subCommandName}'`);
      return;
    }

    const action = subcommands.get(subCommandName);

    // @ts-ignore
    await action(interaction, commandArgs);
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
    // extract command name, value and description
    const { commandName, commandDescription, commandValue } =
      this.getCommandData(interaction);

    // create slash command
    await this.createInstantSlashCommand(
      interaction,
      commandName,
      commandDescription as string,
    );

    // create command with value on mongodb
    const commandCreationError =
      await this.myInstantsRepository.createServerCommand(
        interaction.guildId as string,
        commandName,
        commandValue,
      );

    if (commandCreationError) {
      logger.info(
        `the was an error while creating command ${commandName} on server '${interaction.guild?.name}': ${commandCreationError}`,
      );
      await interaction.editReply('ocorreu um erro ao criar esse comando');
      return;
    }

    // reply with success
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

    const commandUpdateError =
      await this.myInstantsRepository.editServerCommand(
        interaction.guildId as string,
        commandName,
        commandValue,
      );

    if (commandUpdateError) {
      await interaction.editReply('ocorreu um erro ao editar esse comando');
      logger.info(
        `there was an error to edit command '${commandName}' on server ${interaction.guild?.name} (${interaction.guild}))`,
      );

      return;
    }

    await this.createInstantSlashCommand(
      interaction,
      commandName,
      commandDescription,
    );

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

    const commandDeleteError =
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

    await this.deleteInstantSlashCommand(interaction, name);

    logger.info(
      `Command '${name}' deleted from server '${interaction.guild?.name}(${interaction.guildId})'`,
    );
    await interaction.editReply(`comando '${name}' removido com sucesso`);
  };

  handleList = async (interaction: CommandInteraction) => {
    const server = await this.myInstantsRepository.getServer(interaction.guildId as string);

    if (!server?.commands?.length) {
      logger.info(`server '${interaction.guild?.name}' not found`);
      interaction.editReply('não foi possível listar os comandos');
      return;
    }

    const commands = server.commands.map(c => ({
      name:`/${c.alias}`,
      value: c.value,
    }));

    const embed = new MessageEmbed()
      .setTitle('Lista de comandos customizados')
      .setColor('BLUE')
      .addFields(commands)
      .setThumbnail(Assets.macacoSpin);

    interaction.editReply({
      embeds: [
        embed,
      ],
    });
  };

  private getCommandData = (
    interaction: CommandInteraction,
  ): CommandDataType => {
    const nameOption = interaction.options.get('name', true);
    const valueOption = interaction.options.get('value', true);
    const commandDescriptionOption = interaction.options.get(
      'description',
      false,
    );
    const commandValue = this.extractSearch(valueOption?.value as string);
    const commandName = nameOption?.value as string;
    const commandDescription = commandDescriptionOption?.value as string;

    return {
      commandName,
      commandValue,
      commandDescription,
    };
  };

  handleCustomCommand = async (interaction: CommandInteraction) => {
    // get command from mongodb
    const server = await this.myInstantsRepository.getServer(
      interaction.guildId as string,
    );

    if (!server) {
      await interaction.reply('ocorreu um erro ao buscar esse comando');
      logger.info(
        `command '${interaction.commandName}' not found on server '${interaction.guild?.name} (${interaction.guildId})'`,
      );
      return;
    }

    const dbCommand = this.myInstantsRepository.getCommandByAlias(
      server,
      interaction.commandName,
    );

    if (dbCommand) {
      // play sound
      await this.handleInstantPlay(interaction, dbCommand.value);
      await interaction.reply('done');
    }
  };

  private createInstantSlashCommand = async (
    interaction: CommandInteraction,
    commandName: string,
    commandDescription: string | undefined,
  ) => {
    const newSlashcommand = new SlashCommandBuilder().setName(commandName);

    if (commandDescription) {
      newSlashcommand.setDescription(commandDescription as string);
    }

    const rest = new REST({ version: '10' }).setToken(BOT_TOKEN!);
    await rest.put(
      Routes.applicationGuildCommands(
        BOT_CLIENTID!,
        interaction.guildId as string,
      ),
      {
        body: [newSlashcommand.toJSON()],
      },
    );
  };

  private deleteInstantSlashCommand = async (
    interaction: CommandInteraction,
    commandName: string,
  ) => {
    const rest = new REST({ version: '9' }).setToken(BOT_TOKEN!);
    const guildCommands: ISlashCommand[] = (await rest.get(
      Routes.applicationGuildCommands(
        BOT_CLIENTID!,
        interaction.guildId as string,
      ),
    )) as ISlashCommand[];
    const command = guildCommands.find((c) => c.name === commandName);

    if (!command) {
      await interaction.editReply('não foi possível remover esse comando');
      logger.info(
        `SlashCommand '${commandName}' not found on server ${interaction.guild?.name}(${interaction.guildId})`,
      );
      return;
    }

    await rest.delete(
      `${Routes.applicationGuildCommands(
        BOT_CLIENTID!,
        interaction.guildId as string,
      )}/${command.id}`,
    );
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
