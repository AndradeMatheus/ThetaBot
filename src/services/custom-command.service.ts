import { CommandInteraction } from 'discord.js';
import { container } from 'tsyringe';
import { Tokens } from 'utils/loadContainer';
import ICommandsRepository from 'interfaces/repositories/commands';
import ICustomCommandService from 'interfaces/services/custom-command';
import logger from 'utils/logger';
import MyInstantsSlashCommand from 'slash-commands/inst';
import ImageSlashCommand from 'slash-commands/img';
import { ICommand } from 'schemas/command.schema';

export default class CustomCommandService implements ICustomCommandService {
  private commandsRepository: ICommandsRepository =
    container.resolve<ICommandsRepository>(Tokens.ICommandsRepository);
  private myInstantsSlashCommand = container.resolve<MyInstantsSlashCommand>(
    Tokens.MyInstantsSlashCommand,
  );
  private imageSlashCommand = container.resolve<ImageSlashCommand>(
    Tokens.ImageSlashCommand,
  );

  async handle(interaction: CommandInteraction): Promise<string | undefined> {
    await interaction.deferReply();
    const commandName = interaction.commandName;
    const guildId = interaction.guildId;
    const guildName = interaction.guild?.name as string;

    // get command from db
    const command = await this.commandsRepository.getCommandByAlias(
      guildId,
      commandName,
    );

    if (!command) {
      const errorMessage = `command ${commandName} not found on server '${guildName}'(${guildId})`;
      logger.info(errorMessage);
      return errorMessage;
    }

    const actions = new Map<
      'img' | 'inst',
      (fnInteraction: CommandInteraction, fnCommand: ICommand) => Promise<void>
    >();

    // handle inst command by type 'inst'
    actions.set('inst', this.myInstantsSlashCommand.handleCustomCommand);

    // handle img command by type 'img'
    actions.set('img', this.imageSlashCommand.handleCustomCommand);

    const action = actions.get(command.type);

    if (!action) {
      const errorMessage = `action '${command.type}' not found as custom command`;
      logger.info(errorMessage);
      return errorMessage;
    }

    await action(interaction, command);
  }
}
