import { Message, MessageEmbed } from "discord.js";
import Command from "../models/command";
import { getImage } from "../utils/scrapers/google-images";
const { BOT_PREFIX } = process.env;

const handleSearchImage = async (msg: Message) => {
  const query = msg?.content?.replace(`${BOT_PREFIX}img`, "")?.trim();

  if (!query) return;

  const imageUri = await getImage(query);

  if (imageUri) {
    const embed = new MessageEmbed();
    embed.setImage(imageUri);
    embed.setURL(imageUri);
    msg.reply(embed);
  }
};

export default [
  new Command(
    `${BOT_PREFIX}img`,
    "Busca imagem no google",
    "[texto para procurar imagem]",
    handleSearchImage
  ),
];
