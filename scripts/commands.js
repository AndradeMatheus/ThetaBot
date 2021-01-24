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
    const helpParameter = msg.content.split(' ')[1];

    commands.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0).forEach((command) => {
        if (command.description) help.push({name:command.name, value: command.description});
    });

    let helpCommand = commands.find(c => c.name == `${prefix}${helpParameter}`);

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
        .setThumbnail(assets.gatoPop)
        .setFooter('Use .help [comando] para saber mais sobre um comando \nDesconsidere os \'[ ]\'');
        
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

const commands = [
    new Command(`${prefix}agu`, 'Exibe retrato verossímil de Lucão e Ninext', '', handleAgu),    
    new Command(`${prefix}dilera`, 'Buzina dilera', '', handleDilera),
    new Command(`${prefix}leave`, 'Remove o bot do canal de voz :(', '', handleLeave),
    new Command(`${prefix}pause`, 'Pausa a reprodução do aúdio atual', '', handlePause),
    new Command(`${prefix}resume`, 'Resume o áudio pausado', '', handleResume),
    new Command(`${prefix}stop`, 'Cancela a reprodução do áudio', '', handleStop),
    new Command(`${prefix}help`, 'Help!', '[comando]', handleHelp),
    new Command(`${prefix}server-list`, 'Lista todos os servidores que o bot está', '', handleListServers),

    ...myInstantsCommands
]

module.exports = commands;