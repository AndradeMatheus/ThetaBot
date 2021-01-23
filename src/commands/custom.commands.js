import * as Discord from 'discord.js';
import assets from '../assets';
import Command from '../models/command';
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

export default [
    new Command(`${prefix}agu`, 'Exibe retrato verossímil de Lucão e Ninext', handleAgu),    
    new Command(`${prefix}dilera`, 'Buzina dilera', handleDilera),
    new Command(`${prefix}help`, 'Help!', handleHelp)    
]