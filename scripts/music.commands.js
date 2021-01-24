const { promisify } = require('util');
const Discord = require('discord.js');
const assets = require('./assets')
const axios = require('axios');
const Command = require('./command');
const { BOT_PREFIX: prefix } = process.env;

const handleMusic = async (msg)=> {
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
		{ name: 'Próxima:', value: 'nenhuma', inline: true },
	)
    .setFooter('Playing on TEST', assets.musicPlayer.playing);

    msg.channel.send({embed: embed}).then(message => {
        message.react("⏮️")
        .then(()=> message.react("⏹️"))
        .then(()=> message.react("⏸️"))
        .then(()=> message.react("▶️"))
        .then(()=> message.react("⏭️"));
    });
};

const musicCommands = [
    new Command(`${prefix}music`, 'Traz card mockado de música', handleMusic)
];

module.exports = {
    musicCommands
};