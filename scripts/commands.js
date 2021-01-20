const Discord = require('discord.js');
const assets = require('./assets');
const Command = require('./command');
const { myInstantsCommands } = require('./myinstants.commands');
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

const commands = [
    new Command(`${prefix}agu`, 'Exibe retrato verossímil de Lucão e Ninext', handleAgu),    
    new Command(`${prefix}dilera`, 'Buzina dilera', handleDilera),
    new Command(`${prefix}leave`, 'Remove o bot do canal de voz :(', handleLeave),
    new Command(`${prefix}music`, 'Teste de card de música', handleMusic),
    new Command(`${prefix}pause`, 'Pausa a reprodução do aúdio atual', handlePause),
    new Command(`${prefix}resume`, 'Resume o áudio pausado', handleResume),
    new Command(`${prefix}stop`, 'Cancela a reprodução do áudio', handleStop),
    new Command(`${prefix}help`, 'Help!', handleHelp),
    ...myInstantsCommands
]

module.exports = commands;