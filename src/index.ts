import { Client } from "discord.js";

import dotenv from "dotenv";
dotenv.config();

// import "./utils/startDb.ts";
import SlashCommandsService from "services/slash-commands.service";
const { BOT_TOKEN: token } = process.env;

const slashCommandService = new SlashCommandsService();
slashCommandService.loadCommands();

const client = new Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"],
  restTimeOffset: 25,
});

client.login(token);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = slashCommandService.getCommand(interaction.commandName);

  if (command) {
    await command.handle(interaction, client);
  }
});

client.once("ready", () => {
  client?.user?.setActivity(".help", {
    type: "STREAMING",
    url: "http://twitch.tv/tetistiger",
  });

  console.log(`EAE MACACO!`);
});
