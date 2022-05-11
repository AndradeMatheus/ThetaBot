import SlashCommand from 'models/slash-command';

export default interface ISlashCommandsService {
  loadCommands(): Promise<void>;

  getCommand(commandName: string): SlashCommand | undefined;
};
