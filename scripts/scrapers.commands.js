const { MessageEmbed } = require('discord.js');
const { BOT_PREFIX } = process.env;
const Command = require('./command');
const { getImage } = require('../scrapers/google-images');

const handleSearchImage = async (msg) => {
    const query = msg.content.replace(`${BOT_PREFIX}img`, '').trim();

    if (!query) return;

    const imageUri = await getImage(query);

    if (imageUri) {
        const embed = new MessageEmbed();
        embed.setImage(imageUri);
        embed.setURL(imageUri);
        msg.reply(embed);
    }
}

const commands = [
    new Command(`${BOT_PREFIX}img`, 'Busca imagem no google', '[texto para procurar imagem]', handleSearchImage),
];

module.exports = {
    commands,
};