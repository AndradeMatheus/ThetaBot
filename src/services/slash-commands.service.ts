import {
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import { container } from 'tsyringe';
import IEnvironment from 'interfaces/environment';
import ISlashCommandsService from 'interfaces/services/slash-commands';
import SlashCommand from 'models/slash-command';
import logger from '../utils/logger';
import { readdir } from 'fs/promises';
import { Tokens } from 'utils/loadContainer';
import { SlashCommandBuilder } from '@discordjs/builders';
import ISlashCommand from 'interfaces/ISlashCommand';

export default class SlashCommandsService implements ISlashCommandsService {
  private environment: IEnvironment = container.resolve<IEnvironment>(
    Tokens.IEnvironment,
  );
  private commands: Map<string, SlashCommand> = new Map();

  createInstantSlashCommand = async (
    guildId: string,
    guildName: string,
    commandName: string,
    commandDescription: string,
  ): Promise<string | undefined> => {
    try {
      const newSlashcommand = new SlashCommandBuilder()
        .setName(commandName)
        .setDescription(commandDescription as string);

      const rest = new REST({ version: '10' }).setToken(this.environment.Token);
      await rest.put(
        Routes.applicationGuildCommands(this.environment.ClientId, guildId),
        {
          body: [newSlashcommand.toJSON()],
        },
      );
    } catch (error: any) {
      const errorMessage = `there was an error while creating SlashCommand ${commandName} from server '${guildName}'(${guildId}): ${error.message}`;
      logger.error(errorMessage);
      return errorMessage;
    }
  };

  deleteInstantSlashCommand = async (
    guildId: string,
    guildName: string,
    commandName: string,
  ): Promise<string | undefined> => {
    try {
      const rest = new REST({ version: '9' }).setToken(this.environment.Token);
      const guildCommands: ISlashCommand[] = (await rest.get(
        Routes.applicationGuildCommands(this.environment.ClientId, guildId),
      )) as ISlashCommand[];
      const command = guildCommands.find((c) => c.name === commandName);

      if (!command) {
        const errorMessage = `SlashCommand '${commandName}' not found on server ${guildName}(${guildId})`;
        logger.info(errorMessage);
        return errorMessage;
      }

      await rest.delete(
        `${Routes.applicationGuildCommands(
          this.environment.ClientId,
          guildId,
        )}/${command.id}`,
      );
    } catch (error: any) {
      const errorMessage = `there was an error while deleteting command ${commandName} from server '${guildName}'(${guildId}): ${error.message}`;
      logger.error(errorMessage);
      return errorMessage;
    }
  };

  async loadCommands(): Promise<void> {
    const files = await readdir('./src/slash-commands');

    for (const file of files) {
      const { default: Command } = await import(`../slash-commands/${file}`);
      const command = new Command() as SlashCommand;
      this.commands.set(command.name, command);
    }

    this.registerCommands();

    logger.info(`Loaded and registered ${this.commands.size} commands`);
  }

  private async registerCommands() {
    const rest = new REST({ version: '10' }).setToken(this.environment.Token);
    const slashCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
    this.commands.forEach((command) => {
      slashCommands.push(command.getSlashCommandJson());
    });

    await rest.put(Routes.applicationCommands(this.environment.ClientId), {
      body: slashCommands,
    });
  }

  getCommand(commandName: string): SlashCommand | undefined {
    return this.commands.get(commandName);
  }
}
