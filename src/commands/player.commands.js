import * as Discord from 'discord.js';
import Command from '../models/command';
const { BOT_PREFIX: prefix } = process.env;

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

export default [
    new Command(`${prefix}leave`, 'Remove o bot do canal de voz :(', handleLeave),
    new Command(`${prefix}music`, 'Teste de card de música', handleMusic),
    new Command(`${prefix}pause`, 'Pausa a reprodução do aúdio atual', handlePause),
    new Command(`${prefix}resume`, 'Resume o áudio pausado', handleResume),
    new Command(`${prefix}stop`, 'Cancela a reprodução do áudio', handleStop)
]