const Discord = require('discord.js');
const assets = require('./assets');
const Command = require('./command');
const { myInstantsCommands } = require('./myinstants.commands');
const { musicCommands } = require('./music.commands')
const { BOT_PREFIX: prefix } = process.env;

const handleAgu = async (msg) => {
    msg.channel.send(new Discord.MessageAttachment(assets.lucasNinext));
}

const handleDilera = async (msg) => {
  const connection = await msg.member.voice.channel.join();
  connection.play(assets.dileraBuzina);
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
        .setThumbnail(assets.gatoPop)
        
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
    new Command(`${prefix}agu`, 'Exibe retrato verossímil de Lucão e Ninext', '', handleAgu),    
    new Command(`${prefix}dilera`, 'Buzina dilera', '', handleDilera),
    new Command(`${prefix}leave`, 'Remove o bot do canal de voz :(', '', handleLeave),
    new Command(`${prefix}pause`, 'Pausa a reprodução do aúdio atual', '', handlePause),
    new Command(`${prefix}resume`, 'Resume o áudio pausado', '', handleResume),
    new Command(`${prefix}stop`, 'Cancela a reprodução do áudio', '', handleStop),
    new Command(`${prefix}help`, 'Help!', '[comando]', handleHelp),
    ...myInstantsCommands,
    ...musicCommands
]

module.exports = commands;