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
    let help = '';

    for (key in commands) {
        const command = commands[key];

        if (command.description) help += `${command.name}\t\t\t\t${command.description}\n`;
    }

    if (help) msg.reply(`\nSegue a lista de comandos disponíveis: \n${help}`);
};

const commands = {
    [`${prefix}agu`]: new Command(`${prefix}agu`, 'Exibe retrato verocímio de Lucão e Ninext', handleAgu),
    [`${prefix}inst`]: new Command(`${prefix}inst`, 'Busca áudio no MyInstants', handleInstant),
    [`${prefix}dilera`]: new Command(`${prefix}dilera`, 'Buzina dilera', handleDilera),
    [`${prefix}tey`]: new Command(`${prefix}tey`, 'Tey! Quetinho!', handleTey),
    [`${prefix}help`]: new Command(`${prefix}help`, 'Help!', handleHelp)
}

module.exports = commands;