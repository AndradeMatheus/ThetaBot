const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);   
const Discord = require('discord.js');
const assets = require('./assets')
const axios = require('axios');
const Command = require('./command');
const { BOT_PREFIX: prefix } = process.env;

const handleMusic = async (msg)=> {
    const embed = new Discord.MessageEmbed()
    .setTitle('Help')
    .setAuthor('YouTube', 'https://www.pinclipart.com/picdir/middle/530-5305994_icon-youtube-logo-png-clipart.png', 'http://Youtube.com')
    .setColor(0x5b34eb)
    .setTitle("Barões da Pisadinha")
    .setDescription("Recairei")
    .setThumbnail('https://studiosol-a.akamaihd.net/tb/652x652/palcomp3-discografia/7/2/f/2/78abc8f4a92e421582ab8de53833b5f2.jpg')
    .setFooter('Playing on call de doente', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThwie-fFbiGCuFgRxD4nvn1uJzi7bddy_R8g&usqp=CAU');

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