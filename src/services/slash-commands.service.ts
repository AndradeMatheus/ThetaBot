import SlashCommand from "models/slash-command";
import { readdir } from "fs/promises";
import { REST } from "@discordjs/rest";
import {
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from "discord-api-types/v10";
import logger from "../utils/logger";
const { BOT_TOKEN, BOT_CLIENTID } = process.env;

export default class SlashCommandsService {
  private commands: Map<string, SlashCommand> = new Map();

  async loadCommands(): Promise<void> {
    const files = await readdir("./src/slash-commands");

    for (const file of files) {
      const { default: Command } = await import(`../slash-commands/${file}`);
      const command = new Command() as SlashCommand;
      this.commands.set(command.name, command);
    }

    this.registerCommands();

    logger.info(`Loaded and registered ${this.commands.size} commands`);
  }

  private async registerCommands() {
    const rest = new REST({ version: "10" }).setToken(BOT_TOKEN!);
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
