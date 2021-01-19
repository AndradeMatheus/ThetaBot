const Discord = require('discord.js');
const axios = require('axios');
const config = require('../config');
const Command = require('./command');
const { prefix, botId } = config.config;

const handleAgu = async (msg) => {
    msg.channel.send(new Discord.MessageAttachment(`https://cdn.discordapp.com/attachments/785238813919805451/785707669125464104/unknown.png`));
}

const handleInstant = async (msg) => {
    let search = msg.content.replace(`${prefix}inst `, '');
    let instant = await getMyInstants(search);
  
    if (!!instant.sound && msg.member.voice.channel) {
        const connection = await msg.member.voice.channel.join();
        connection.play(instant.sound);

        setTimeout(_ => msg.member.voice.channel.leave(), 15000);
    }
    else {
        msg.reply("instant não encontrado");
    }
}

const getMyInstants = async(search) => {
    let query = search.replace(/ /g, "-");
    try {
        const response = await axios.get(`https://www.myinstants.com/api/v1/instants/${query}`)
        if(response.data.sound) return response.data;
    }
    catch(err) {
        return err;
    }
}

const handleDilera = async (msg) => {
  const connection = await msg.member.voice.channel.join();
  connection.play("https://www.myinstants.com/media/sounds/buzinaprolongada.mp3");
}

const handleTey = async (msg) => {
  const connection = await msg.member.voice.channel.join();
  connection.play("https://www.myinstants.com/media/sounds/tey-quietinho-bydilera.mp3");
}

const handleHelp = async (msg) => {
    let help = [];

    commands.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0).forEach((command) => {
        if (command.description) help.push({name:command.name, value: command.description});
    });

    if (help.length){
        const embed = new Discord.MessageEmbed()
        .setTitle('Help')
        .setColor(0x5b34eb)
        .addFields(help)
        .setThumbnail('https://i.kym-cdn.com/photos/images/newsfeed/001/931/959/2e4.gif')
        
        msg.channel.send(embed);
    } 
}

const handleLeave = async (msg) => {
    await msg.member.voice.channel.leave();
};

const getPlayer = (msg) => msg.guild.voice && msg.guild.voice.connection && msg.guild.voice.connection.player;

const handlePause = async (msg) => {
    const player = getPlayer(msg);
    if (player) player.dispatcher.pause();
};

const handleResume = async (msg) => {
    const player = getPlayer(msg);
    if (player) player.dispatcher.resume();
};

const handleStop = async (msg) => {
    const player = getPlayer(msg);
    if (player) player.dispatcher.destroy();
};

const commands = [
    new Command(`${prefix}agu`, 'Exibe retrato verossímil de Lucão e Ninext', handleAgu),
    new Command(`${prefix}inst`, 'Busca áudio no MyInstants', handleInstant),
    new Command(`${prefix}dilera`, 'Buzina dilera', handleDilera),
    new Command(`${prefix}tey`, 'Tey! Quetinho!', handleTey),
    new Command(`${prefix}leave`, 'Remove o bot do canal de voz :(', handleLeave),
    new Command(`${prefix}pause`, 'Pausa o aúdio', handlePause),
    new Command(`${prefix}resume`, 'Resume o áudio', handleResume),
    new Command(`${prefix}stop`, 'Para o aúdio', handleStop),
    new Command(`${prefix}help`, 'Help!', handleHelp)
]

module.exports = commands;