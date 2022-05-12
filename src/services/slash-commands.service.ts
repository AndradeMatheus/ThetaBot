import {
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from 'discord-api-types/v10';
import ISlashCommandsService from 'interfaces/services/slash-commands';
import { REST } from '@discordjs/rest';
import SlashCommand from 'models/slash-command';
import logger from '../utils/logger';
import { readdir } from 'fs/promises';

const { BOT_TOKEN, BOT_CLIENTID } = process.env;
export default class SlashCommandsService implements ISlashCommandsService {
  private commands: Map<string, SlashCommand> = new Map();

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
    const rest = new REST({ version: '10' }).setToken(BOT_TOKEN!);
    const slashCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
    this.commands.forEach((command) => {
      slashCommands.push(command.getSlashCommandJson());
    });

    await rest.put(Routes.applicationCommands(BOT_CLIENTID!), {
      body: slashCommands,
    });
  }

  getCommand(commandName: string): SlashCommand | undefined {
    return this.commands.get(commandName);
  }
}
