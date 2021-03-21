import * as Discord from 'discord.js';
import assets from '../assets';
import Command from '../models/command';
import allCommands from './index';
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
    const helpParameter = msg.content.split(' ')[1];

    allCommands.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0).forEach((command) => {
        if (command.description) help.push({name:command.name, value: command.description});
    });

    let helpCommand = allCommands.find(c => c.name == `${prefix}${helpParameter}`);

    if(helpCommand){
        const embed = new Discord.MessageEmbed()
        .setTitle(helpCommand.name)
        .setDescription(helpCommand.description)
        .setColor(assets.theta.color)
        .addFields(
        {
            name: 'Exemplo de uso:',
            value: helpCommand.help ? `${helpCommand.name} ${helpCommand.help}` : 'Este comando não possui parâmetros adicionais'
        })
        .setFooter(helpCommand.help ? 'Desconsidere os \'[ ]\'' : '')
        
        msg.channel.send(embed);
    }
    else if(helpParameter && !helpCommand)
    {
        msg.reply('esse comando não existe');
    }
    else if (help.length){
        const embed = new Discord.MessageEmbed()
        .setTitle('Help')
        .setColor(assets.theta.color)
        .addFields(help)
        .setThumbnail(assets.macacoWakey)
        .setFooter(`---------------------------------------------------------------------
Use .help [comando] para saber mais sobre um comando \nDesconsidere os \'[ ]\'\n\ngithub.com/AndradeMatheus/ThetaBot`);
        
        msg.channel.send(embed);
    } 
}

const handleListServers = async (msg, client) =>{
    let guilds = 
    {
        list: '- ' + client.guilds.cache.array().join('\n- '),
        count: client.guilds.cache.array().length
    }

    const serverlist = new Discord.MessageEmbed()
      .setTitle(`Estou em ${guilds.count} servidores:`)
      .setColor(assets.theta.color)
      .setDescription(guilds.list)
      .setThumbnail(assets.macacoSurpreso)
      .setFooter(`Me convide para o seu servidor!\n${assets.theta.inviteShort}`)

      msg.channel.send(serverlist)
}

const customCommands = [
    new Command(`${prefix}agu`, 'Exibe retrato verossímil de Lucão e Ninext', handleAgu),    
    new Command(`${prefix}dilera`, 'Buzina dilera', handleDilera),
    new Command(`${prefix}help`, 'Help!', handleHelp, '[comando]'),
    new Command(`${prefix}server-list`, 'Lista todos os servidores que o bot está', handleListServers)
];

export default customCommands;