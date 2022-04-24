import { Message, MessageEmbed } from "discord.js";
import axios from "axios";
import Assets from "../utils/assets";
import Command, { CommandHandlerType } from "../models/command";
import IMyInstantResponse from "../interfaces/IMyInstantResponse";
import logger from "../utils/logger";
const { BOT_PREFIX: prefix } = process.env;

import {
  getServer,
  createServerCommand,
  deleteServerCommand,
  editServerCommand,
} from "../repositories/myinstants-repository";

export const getInstantAlias = async (command: string, msg: Message) => {
  if (command.startsWith(prefix || ".")) {
    const server = await getServer(msg.guild?.id!);

    if (!server) {
      logger.info(`server ${msg.guild?.id!} not found`);
      return;
    }

    command = command.replace(prefix!, "");
    const serverCommand = server.commands.find((c) => c.alias == command);

    if (command && serverCommand) {
      handleInstant(msg, serverCommand.value);
    }
  }
};

const handleInstant = async (
  msg: Message,
  commandArg: CommandHandlerType
): Promise<void> => {
  const command = commandArg as Extract<CommandHandlerType, string>;
  const search =
    typeof command === "object"
      ? msg?.content?.replace(`${prefix}inst `, "")
      : command;
  const instant = await getMyInstants(search);

  if (!!instant?.sound && msg?.member?.voice?.channel) {
    const connection = await msg.member.voice.channel.join();
    connection?.play(instant.sound);

    const FIVE_MINUTES_IN_MILISECONDS = 5 * 60 * 1000;
    setTimeout(
      () => msg?.member?.voice?.channel?.leave(),
      FIVE_MINUTES_IN_MILISECONDS
    );
  } else {
    msg.reply("instant não encontrado");
  }
};

const getMyInstants = async (
  search: string
): Promise<IMyInstantResponse | null> => {
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
};

const handleInstantCreateAlias = async (msg: Message) => {
  try {
    const { alias, sound } = parseInstantCommand(msg, "inst-create");
    const commandValid = await isCommandValid(alias, sound);

    if (commandValid) {
      const createServerCommandError = await createServerCommand(
        msg.guild?.id!,
        alias,
        sound
      );

      if (createServerCommandError) {
        errorReply(msg, "", createServerCommandError);
      } else {
        msg.reply(
          `seu alias **${alias}** do som **${sound}** foi criado com sucesso!`
        );
      }
    }
  } catch (err) {
    msg.reply("não foi possível criar o alias, verifique o seu comando.");
  }
};

const handleInstantListAlias = async (msg: Message) => {
  const server = await getServer(msg.guild?.id!);

  if (server?.commands?.length) {
    const aliases = server.commands.map((c) => ({
      name: `${prefix}${c.alias}`,
      value: c.value,
    }));

    const embed = new MessageEmbed()
      .setTitle("Lista de alias")
      .setColor(Assets.theta.color)
      .addFields(aliases)
      .setThumbnail(Assets.macacoSpin);

    msg.channel.send(embed);
  } else {
    msg.reply("não existem aliases nesse servidor.");
  }
};

const handleInstantDeleteAlias = async (msg: Message) => {
  const arrCommand = msg.content.split(" ");

  if (arrCommand.length > 1) {
    const alias = arrCommand[1].replace(".", "");

    if (alias) {
      const deleteAliasError = await deleteServerCommand(msg.guild?.id!, alias);

      if (deleteAliasError) {
        errorReply(
          msg,
          `não foi possível editar o alias ${alias}`,
          deleteAliasError
        );
      } else {
        msg.reply(`alias **${alias}** removido`);
      }
    }
  }
};

const handleInstantEditAlias = async (msg: Message) => {
  const { alias, sound } = parseInstantCommand(msg, "inst-edit");
  const commandValid = await isCommandValid(alias, sound);

  if (commandValid) {
    const commandEditError = await editServerCommand(
      msg.guild?.id!,
      alias,
      sound
    );

    if (commandEditError) {
      errorReply(
        msg,
        `não foi possível editar o alias ${alias}`,
        commandEditError
      );
    } else {
      msg.reply(`alias **${alias}** alterado para o som **${sound}**`);
    }
  }
};

const isCommandValid = async (
  alias: string,
  sound: string
): Promise<boolean> => {
  const instant = await getMyInstants(sound);
  const commandValid = !!alias && !!sound && !!instant?.sound;

  return commandValid;
};

const parseInstantCommand = (msg: Message, commandName: string) => {
  const command = msg.content.replace(`${prefix}${commandName} `, "");
  const alias = command.split(" ")[0];
  const arrSound = command.split(" ")[1];
  const sound = arrSound.includes("myinstants.com")
    ? arrSound
        .replace("https://", "")
        .replace("http://", "")
        .replace("www.", "")
        .replace("myinstants.com/instant/", "")
        .replace("/", "")
    : arrSound.replace("/", "");

  return { command, alias, sound };
};

const errorReply = (msg: Message, reply: string, logMessage: string) => {
  msg.reply(reply);
  logger.info(logMessage);
};

export default [
  new Command(
    `${prefix}inst`,
    "Busca áudio no MyInstants",
    "[link ou nome do audio]",
    handleInstant
  ),
  new Command(
    `${prefix}inst-create`,
    "Define um alias pra uma url do MyInstants",
    "[alias] [link ou nome do audio]",
    handleInstantCreateAlias
  ),
  new Command(
    `${prefix}inst-list`,
    "Lista os aliases criados nesse servidor",
    "",
    handleInstantListAlias
  ),
  new Command(
    `${prefix}inst-edit`,
    "Edita um alias",
    "[alias] [novo link ou nome do audio]",
    handleInstantEditAlias
  ),
  new Command(
    `${prefix}inst-delete`,
    "Deleta um alias",
    "[alias]",
    handleInstantDeleteAlias
  ),
];
