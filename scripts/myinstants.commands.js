const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);   
const Discord = require('discord.js');
const assets = require('./assets')
const axios = require('axios');
const Command = require('./command');
const { BOT_PREFIX: prefix } = process.env;

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
        const file = await getInstantsAliasFromFile();
        if(file){
            command = command.replace(prefix, '');
            let server = file.servers[msg.guild.id];
            
            if(server && command in server.aliases){
                handleInstant(msg, server.aliases[command])
            }
        }
    }
}

const handleInstantCreateAlias = async(msg) => {
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

        const file = await getInstantsAliasFromFile();

        if (file){
            let server = file.servers[msg.guild.id];
    
            if(server){
                server.aliases[alias] = sound;
            }
            else{
                file.servers[msg.guild.id] = {aliases: {[alias]: sound}};
            }
            
            persistInstantsAlias(file);
    
            msg.reply(`seu alias **${alias}** do som **${sound}** foi criado com sucesso!`)            
        }

    }
    catch(err){
        msg.reply("Não foi possível criar o alias, verifique o seu comando.")
    }
}

const handleInstantListAlias = async (msg) => {    
    const file = await getInstantsAliasFromFile();

    if (file){
        let server = file.servers[msg.guild.id];
        
        if(server){
            let aliases = []
            
            Object.entries(server.aliases).map(([k, v]) => aliases.push({name:`${prefix}${k}`, value:v}))
            
            const embed = new Discord.MessageEmbed()
            .setTitle('Lista de alias')
            .setColor(0x5b34eb)
            .addFields(aliases)
            .setThumbnail(assets.macacoNotebook)
            
            msg.channel.send(embed);
        }
        else {
            msg.reply("Não existem aliases nesse servidor.");
        }
    }
}   

const handleInstantDeleteAlias = async (msg) => {
    msg.reply("esse comando não funciona ainda, não saber ler, macaco?")
}

const handleInstantEditAlias = async (msg) => {
    msg.reply("esse comando não funciona ainda, não saber ler, macaco?")
}

const getInstantsAliasFromFile = async () => {

    try {
        if (!fs.existsSync('./storage/instants-aliases.json')){
            const data = { servers: {} };
            persistInstantsAlias(data);
            return data;
        }

        const data = await readFile('./storage/instants-aliases.json');
        return JSON.parse(data.toString());
    } catch (error) {
        console.log('Ocorreu um erro ao ler arquivo de alias de instants');
    }

}

const persistInstantsAlias = async (data) => {
    fs.writeFileSync('./storage/instants-aliases.json', typeof data !== 'string' ? JSON.stringify(data) : data);
}

const myInstantsCommands = [
    new Command(`${prefix}inst`, 'Busca áudio no MyInstants', handleInstant),
    new Command(`${prefix}inst-create`, 'Define um alias pra uma url do MyInstants', handleInstantCreateAlias),
    new Command(`${prefix}inst-list`, 'Lista os aliases criados nesse servidor', handleInstantListAlias),
    new Command(`${prefix}inst-edit`, 'Não implementado', handleInstantDeleteAlias),
    new Command(`${prefix}inst-delete`, 'Não implementado', handleInstantEditAlias),
];

module.exports = {
    myInstantsCommands,
    getInstantAlias
};