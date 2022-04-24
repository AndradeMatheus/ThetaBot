import { SlashCommandBuilder } from "@discordjs/builders";
import axios from "axios";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { BaseCommandInteraction } from "discord.js";
import IMyInstantResponse from "interfaces/IMyInstantResponse";
import SlashCommand, { CommandHandlerType } from "models/slash-command";

export default class MyInstantsSlashCommand extends SlashCommand {
  constructor() {
    super(
      "inst",
      "MyInstants commands",
      "/inst {play | create | edit | delete}"
    );
  }

  getSlashCommandJson(): RESTPostAPIApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand((play) =>
        play
          .setName("play")
          .setDescription("play a MyInstant audio by name/url")
          .addStringOption((opt) =>
            opt
              .setName("value")
              .setDescription("MyInstant audio name or full url")
              .setRequired(true)
          )
      )
      .toJSON();
  }

  private async getMyInstants(
    search: string
  ): Promise<IMyInstantResponse | null> {
    const query = search.replace(/ /g, "-");
    try {
      const response = await axios.get(
        `https://www.myinstants.com/api/v1/instants/${query}`
      );

      return response.data as IMyInstantResponse;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(`there was an error while searching myinstant '${query}'`);
      return null;
    }
  }

  handle = async (
    interaction: BaseCommandInteraction,
    commandArgs: CommandHandlerType
  ): Promise<void> => {
    await interaction.deferReply();
    // @ts-ignore
    const subCommandName = interaction.options.getSubcommand() as string;
    const subcommands = new Map<
      string,
      (
        interaction: BaseCommandInteraction,
        commandArgs: CommandHandlerType
      ) => Promise<void>
    >();
    subcommands.set("play", this.handlePlay);

    if (!subcommands.has(subCommandName)) {
      await interaction.reply(`invalid command '${subCommandName}'`);
      return;
    }

    const action = subcommands.get(subCommandName);

    // @ts-ignore
    await action(interaction, commandArgs);
    await interaction.editReply("done");
  };

  handlePlay = async (interaction: BaseCommandInteraction) => {
    const option = interaction.options.get("value");
    const instant = await this.getMyInstants(option?.value as string);

    if (!instant?.sound) {
      interaction.editReply("instant not found");
      return;
    }

    const connection = await this.getVoiceChannelConnection(interaction);

    if (!connection) {
      interaction.editReply("voice channel not found");
      return;
    }

    await this.connectToVoiceChannelAndPlay(
      connection,
      interaction,
      instant.sound
    );

    const FIVE_MINUTES_IN_MILISECONDS = 5 * 60 * 1000;
    setTimeout(() => connection.disconnect(), FIVE_MINUTES_IN_MILISECONDS);
  };
}
