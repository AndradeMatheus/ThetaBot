import * as Discord from 'discord.js';
import Command from '../models/command';
const { BOT_PREFIX: prefix } = process.env;

const handleLeave = async (msg) => {
    await msg.member.voice.channel.leave();
};

const getPlayer = (msg) => msg.guild.voice?.connection?.player;

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

const playerCommands = [
    new Command(`${prefix}leave`, 'Remove o bot do canal de voz :(', handleLeave),
    new Command(`${prefix}pause`, 'Pausa a reprodução do aúdio atual', handlePause),
    new Command(`${prefix}resume`, 'Resume o áudio pausado', handleResume),
    new Command(`${prefix}stop`, 'Cancela a reprodução do áudio', handleStop)
];

export default playerCommands;