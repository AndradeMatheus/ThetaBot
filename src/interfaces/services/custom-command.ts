import { CommandInteraction } from "discord.js";

export default interface ICustomCommandService {
  handle(
    interaction: CommandInteraction,
  ): Promise<string | undefined>;
};