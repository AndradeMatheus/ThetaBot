import * as Discord from 'discord.js';
import assets from '../assets';
import Command from '../models/command';
const { BOT_PREFIX: prefix } = process.env;

const handlePlay = async (msg)=> {
    const command = parseMusicCommand(msg, 'play');

    if (msg.member.voice.channel) {
        const connection = await msg.member.voice.channel.join();
        connection.play(instant.sound);

        setTimeout(_ => msg.member.voice.channel.leave(), 300000);
    }
    else {
        msg.reply("você não está em um canal de voz");
    }

    const embed = new Discord.MessageEmbed()
    .setAuthor('YouTube', assets.youtube.logo, 'http://youtube.com')
    .setColor(assets.youtube.color)
    .setTitle("Barões da Pisadinha")
    .setDescription("Recairei")
    .setThumbnail('https://studiosol-a.akamaihd.net/tb/652x652/palcomp3-discografia/7/2/f/2/78abc8f4a92e421582ab8de53833b5f2.jpg')
    .addFields(
        { name: '\u200B', value: '\u200B' },
		{ name: 'Pedido por:⠀⠀⠀⠀⠀', value: msg.author.username , inline: true },
        { name: 'Duração:⠀⠀⠀⠀⠀⠀', value: '13:25m', inline: true },
		{ name: 'Próxima:', value: 'undefined', inline: true },
	)
    .setFooter('Playing on TEST', assets.musicPlayer.playing);

    msg.channel.send({ embed });
};

const parseMusicCommand = (msg, commandName) => {
    let command = msg.content.replace(`${prefix}${commandName} `, '');

    return command;
};

const musicCommands = [
    new Command(`${prefix}play`, 'Toca uma música por URL do youtube', handlePlay, '[link]')
];

module.exports = {
    musicCommands
};