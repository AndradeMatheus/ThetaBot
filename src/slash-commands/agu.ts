import { SlashCommandBuilder } from "@discordjs/builders";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { BaseCommandInteraction, MessageEmbed } from "discord.js";
import SlashCommand from "models/slash-command";
import Assets from "../utils/assets";

export default class AguSlashCommand extends SlashCommand {
  constructor() {
    super("agu", "Exibe retrato verossímil de Lucão e Ninext");
  }

  getSlashCommandJson(): RESTPostAPIApplicationCommandsJSONBody {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .toJSON();
  }

  async handle(interaction: BaseCommandInteraction): Promise<void> {
    await interaction.reply({
      embeds: [
        new MessageEmbed({
          description: "Lucão e Ninext",
          image: {
            url: Assets.lucasNinext,
          },
        }),
      ],
    });
  }
}
