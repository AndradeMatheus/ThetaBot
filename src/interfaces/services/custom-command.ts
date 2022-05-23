import { CommandInteraction } from 'discord.js';

interface ICustomCommandService {
  handle(interaction: CommandInteraction): Promise<string | undefined>;
}

export default ICustomCommandService;
