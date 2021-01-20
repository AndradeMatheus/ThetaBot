const Discord = require('discord.js');
const axios = require('axios');
const Command = require('./command');
const fs = require('fs');
const { BOT_PREFIX: prefix } = process.env;

const handleAgu = async (msg) => {
    msg.channel.send(new Discord.MessageAttachment(`https://cdn.discordapp.com/attachments/785238813919805451/785707669125464104/unknown.png`));
}

const handleInstant = async (msg, command = null) => {
    let search = !command ? msg.content.replace(`${prefix}inst `, '') : command;
    let instant = await getMyInstants(search);
  
    if (!!instant.sound && msg.member.voice.channel) {
        const connection = await msg.member.voice.channel.join();
        connection.play(instant.sound);

        setTimeout(_ => msg.member.voice.channel.leave(), 300000);
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

const getInstantAlias = async(command, msg) => {
    fs.readFile('./storage/instants-aliases.json', (err, data) => {
        if (err) {
            console.log("ocorreu um erro ao ler o arquivo de aliases.");
            msg.reply("ocorreu um erro ao ler o arquivo de aliases ou ele não existe.");
        }else if(command.startsWith(prefix)){
            command = command.replace(prefix, '');
            const file =  JSON.parse(data.toString());
            let server = file.servers[msg.guild.id];
            
            if(server){
                handleInstant(msg, server.aliases[command])
            }
            else msg.reply("Não existem aliases nesse servidor.");
        }
    });
}

const handleInstantCreateAlias = async(msg) => {
    if(!fs.existsSync('./storage/instants-aliases.json')){
        data = JSON.stringify({servers: {}});
        fs.writeFileSync('./storage/instants-aliases.json', data);
    }

    try{
        let command = msg.content.replace(`${prefix}inst-create `, '');
        let alias = command.split(' ')[0];
        let arrSound = command.split(' ')[1];
        let sound = arrSound.includes('myinstants.com') ? arrSound
                                                          .replace("https://", "")
                                                          .replace("http://", "")
                                                          .replace("www.", "")
                                                          .replace("myinstants.com/instant/", "")
                                                          .replace("/", "")
                                                          : arrSound.replace("/", "");

        fs.readFile('./storage/instants-aliases.json', (err, data) => {
            if (err) {
                throw err;
            }
            const file = JSON.parse(data.toString());
            let server = file.servers[msg.guild.id];

            if(server) server.aliases[alias] = sound;
            else file.servers[msg.guild.id] = {aliases: {[alias]: sound}};

            fs.writeFileSync('./storage/instants-aliases.json', JSON.stringify(file));
        });

        msg.reply(`seu alias **${alias}** do som **${sound}** foi criado com sucesso!`)
    }
    catch(err){
        msg.reply("Não foi possível criar o alias, verifique o seu comando.")
    }
}

const handleInstantListAlias = async (msg) => {
    fs.readFile('./storage/instants-aliases.json', (err, data) => {
        if (err) {
            console.log("ocorreu um erro ao ler o arquivo de aliases.");
            msg.reply("ocorreu um erro ao ler o arquivo de aliases ou ele não existe.");
        }else{
            const file =  JSON.parse(data.toString());
            let server = file.servers[msg.guild.id];
            
            if(server){
                let aliases = []
                
                Object.entries(server.aliases).map(([k, v]) => aliases.push({name:`${prefix}${k}`, value:v}))
                
                const embed = new Discord.MessageEmbed()
                .setTitle('Lista de alias')
                .setColor(0x5b34eb)
                .addFields(aliases)
                .setThumbnail('https://i.gifer.com/iXR.gif')
                
                msg.channel.send(embed);
            }
            else msg.reply("Não existem aliases nesse servidor.");
        }
    });
}

const handleInstantDeleteAlias = async (msg) => {
    msg.reply("esse comando não funciona ainda, não saber ler, macaco?")
}

const handleInstantEditAlias = async (msg) => {
    msg.reply("esse comando não funciona ainda, não saber ler, macaco?")
}

const handleDilera = async (msg) => {
  const connection = await msg.member.voice.channel.join();
  connection.play("https://www.myinstants.com/media/sounds/buzinaprolongada.mp3");
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
    new Command(`${prefix}inst-create`, 'Define um alias pra uma url do MyInstants', handleInstantCreateAlias),
    new Command(`${prefix}inst-list`, 'Lista os aliases criados nesse servidor', handleInstantListAlias),
    new Command(`${prefix}inst-edit`, 'Não implementado', handleInstantDeleteAlias),
    new Command(`${prefix}inst-delete`, 'Não implementado', handleInstantEditAlias),
    new Command(`${prefix}dilera`, 'Buzina dilera', handleDilera),
    new Command(`${prefix}leave`, 'Remove o bot do canal de voz :(', handleLeave),
    new Command(`${prefix}pause`, 'Pausa a reprodução do aúdio atual', handlePause),
    new Command(`${prefix}resume`, 'Resume o áudio pausado', handleResume),
    new Command(`${prefix}stop`, 'Cancela a reprodução do áudio', handleStop),
    new Command(`${prefix}help`, 'Help!', handleHelp)
]

module.exports = {commands, getInstantAlias};