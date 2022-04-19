const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);   
const Discord = require('discord.js');
const assets = require('./assets')
const axios = require('axios');
const Command = require('./command');
const { BOT_PREFIX: prefix } = process.env;

const myInstantsRepository = require('../repositories/myinstants-repository');

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
    if (command.startsWith(prefix)){
        const server = await myInstantsRepository.getServer(msg.guild.id);

        if (!server){
            console.log(`server ${msg.guild.id} not found`);
            return;
        }

        command = command.replace(prefix, '');
        const serverCommand = server.commands.find(c => c.alias == command);

        if (command){
            handleInstant(msg, serverCommand.value);
        }
    }
}

const handleInstantCreateAlias = async (msg) => {
    try{        
        const { alias, sound } = parseInstantCommand(msg, 'inst-create');
        const instant = await getMyInstants(sound);
        const commandValid = alias && sound && !!instant.sound;

        if (commandValid){
            const createServerCommandError = await myInstantsRepository.createServerCommand(msg.guild.id, alias, sound);

            if (createServerCommandError) {
                errorReply(msg, '', createServerCommandError)
            }
            else {
                msg.reply(`seu alias **${alias}** do som **${sound}** foi criado com sucesso!`);
            }
        }
    }
    catch(err){
        msg.reply("não foi possível criar o alias, verifique o seu comando.")
    }
}

const handleInstantListAlias = async (msg) => {
    let server = await myInstantsRepository.getServer(msg.guild.id);

    if (server){

        if(server.commands.length){
            let aliases = server.commands.map(c => ({ name:`${prefix}${c.alias}`, value: c.value }));
            
            const embed = new Discord.MessageEmbed()
            .setTitle('Lista de alias')
            .setColor(assets.theta.color)
            .addFields(aliases)
            .setThumbnail(assets.macacoSpin)
            
            msg.channel.send(embed);
        }
        else {
            msg.reply("não existem aliases nesse servidor.");
        }
    }
}   

const handleInstantDeleteAlias = async (msg) => {
    const arrCommand = msg.content.split(' ');

    if (arrCommand.length > 1){
        const alias = arrCommand[1].replace('.', '');

        if (alias){
            const deleteAliasError = await myInstantsRepository.deleteServerCommand(msg.guild.id, alias);

            if (deleteAliasError) {
                errorReply(msg, `não foi possível editar o alias ${alias}`, deleteAliasError)
            } else {
                msg.reply(`alias **${alias}** removido`);
            }
        }
    }    
}

const handleInstantEditAlias = async (msg) => {
    const { alias, sound } = parseInstantCommand(msg, 'inst-edit');
    const commandValid = await isCommandValid(alias, sound);
    
    if (commandValid){
        const commandEditError = await myInstantsRepository.editServerCommand(msg.guild.id, alias, sound)
        
        if(commandEditError){
            errorReply(msg, `não foi possível editar o alias ${alias}`, commandEditError)
        }
        else {
            msg.reply(`alias **${alias}** alterado para o som **${sound}**`);
        }
    }
}

const isCommandValid = async (alias, sound) => {
    const instant = await getMyInstants(sound);
    const commandValid = alias && sound && !!instant.sound;

    return commandValid;
}

const parseInstantCommand = (msg, commandName) => {
    let command = msg.content.replace(`${prefix}${commandName} `, '');
    let alias = command.split(' ')[0];
    let arrSound = command.split(' ')[1];
    let sound = arrSound.includes('myinstants.com') ? arrSound
                                                        .replace("https://", "")
                                                        .replace("http://", "")
                                                        .replace("www.", "")
                                                        .replace("myinstants.com/instant/", "")
                                                        .replace("/", "")
                                                        : arrSound.replace("/", "");

    return { command, alias, sound };
};

const errorReply = (msg, reply, logMessage) => {
    msg.reply(reply)
    console.log(logMessage)
}

const myInstantsCommands = [
    new Command(`${prefix}inst`, 'Busca áudio no MyInstants', '[link ou nome do audio]', handleInstant),
    new Command(`${prefix}inst-create`, 'Define um alias pra uma url do MyInstants', '[alias] [link ou nome do audio]\n**ATENÇÃO: OS ALIASES RESETAM [DESENVOLVIMENTO]**', handleInstantCreateAlias),
    new Command(`${prefix}inst-list`, 'Lista os aliases criados nesse servidor', '', handleInstantListAlias),
    new Command(`${prefix}inst-edit`, 'Edita um alias', '[alias] [novo link ou nome do audio]', handleInstantEditAlias),
    new Command(`${prefix}inst-delete`, 'Deleta um alias', '[alias]', handleInstantDeleteAlias),
];

module.exports = {
    myInstantsCommands,
    getInstantAlias
};