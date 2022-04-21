import { Message, MessageAttachment, MessageEmbed, Client } from 'discord.js';
import Assets from '../utils/assets';
import Command from '../models/command';
import MyInstantsCommands from './myinstants.commands';
import ScrapersCommands from './scrapers.commands';
const { BOT_PREFIX: prefix } = process.env;

const handleAgu = async (msg: Message) => {
    msg?.channel?.send(new MessageAttachment(Assets.lucasNinext));
}

const handleDilera = async (msg: Message) => {
  const connection = await msg?.member?.voice?.channel?.join();
  connection?.play(Assets.dileraBuzina);
}

const handleHelp = async (msg: Message) => {
    const help: { name: string, value: string }[] = [];
    const helpParameter = msg.content.split(' ')[1];

    commands
        .sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
        .filter(c => c.description)
        .forEach((command) => {
            help.push({ name:command.name, value: command.description });
        });

    let helpCommand = commands.find(c => c.name == `${prefix}${helpParameter}`);

    if(helpCommand){
        const embed = new MessageEmbed()
        .setTitle(helpCommand.name)
        .setDescription(helpCommand.description)
        .setColor(Assets.theta.color)
        .addFields(
        {
            name: 'Exemplo de uso:',
            value: helpCommand.help ? `${helpCommand.name} ${helpCommand.help}` : 'Este comando não possui parâmetros adicionais'
        })
        .setFooter(helpCommand.help ? 'Desconsidere os \'[ ]\'' : '')
        
        msg?.channel?.send(embed);
    }
    else if(helpParameter && !helpCommand)
    {
        msg?.reply('esse comando não existe');
    }
    else if (help.length){
        const embed = new MessageEmbed()
        .setTitle('Help')
        .setColor(Assets.theta.color)
        .addFields(help)
        .setThumbnail(Assets.macacoWakey)
        .setFooter(`---------------------------------------------------------------------
Use .help [comando] para saber mais sobre um comando \nDesconsidere os \'[ ]\'\n\ngithub.com/AndradeMatheus/ThetaBot`);
        
        msg?.channel?.send(embed);
    } 
}

const handleLeave = (msg: Message) => msg?.member?.voice?.channel?.leave();

// TODO: procurar tipo correto do player
const getPlayer = (msg: Message): any => msg?.guild?.voice?.connection?.player;

const handlePause = async (msg: Message) => {
    const player = getPlayer(msg);
    if (player) player.dispatcher.pause();
};

const handleResume = async (msg: Message) => {
    const player = getPlayer(msg);
    if (player) player.dispatcher.resume();
};

const handleStop = async (msg: Message) => {
    const player = getPlayer(msg);
    if (player) player.dispatcher.destroy();
};

const handleListServers = async (msg: Message, client: Client) =>{
    let guilds = 
    {
        list: '- ' + client.guilds.cache.array().join('\n- '),
        count: client.guilds.cache.array().length
    }

    const serverlist = new MessageEmbed()
      .setTitle(`Estou em ${guilds.count} servidores:`)
      .setColor(Assets.theta.color)
      .setDescription(guilds.list)
      .setThumbnail(Assets.macacoSurpreso)
      .setFooter(`Me convide para o seu servidor!\n${Assets.theta.inviteShort}`)

      msg.channel.send(serverlist)
}

const commands: Command[] = [
    new Command(`${prefix}agu`, 'Exibe retrato verossímil de Lucão e Ninext', '', handleAgu),    
    new Command(`${prefix}dilera`, 'Buzina dilera', '', handleDilera),
    new Command(`${prefix}leave`, 'Remove o bot do canal de voz :(', '', handleLeave),
    new Command(`${prefix}pause`, 'Pausa a reprodução do aúdio atual', '', handlePause),
    new Command(`${prefix}resume`, 'Resume o áudio pausado', '', handleResume),
    new Command(`${prefix}stop`, 'Cancela a reprodução do áudio', '', handleStop),
    new Command(`${prefix}help`, 'Help!', '[comando]', handleHelp),
    new Command(`${prefix}server-list`, 'Lista todos os servidores que o bot está', '', handleListServers),

    ...MyInstantsCommands,
    ...ScrapersCommands
]

export default commands;
