import { Message } from "discord.js";

export const handleDeleteMessage = async (msg: Message, timeout: number) => {
  setTimeout(function () {
    msg.delete();
  }, timeout);
};
