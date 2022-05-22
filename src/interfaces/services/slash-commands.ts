import SlashCommand from 'models/slash-command';

export default interface ISlashCommandsService {
  loadCommands(): Promise<void>;

  getCommand(commandName: string): SlashCommand | undefined;

  createInstantSlashCommand(
    guildId: string,
    guildName: string,
    commandName: string,
    commandDescription: string,
  ): Promise<string | undefined>;

  deleteInstantSlashCommand(
    guildId: string,
    guildName: string,
    commandName: string,
  ): Promise<string | undefined>;
};
