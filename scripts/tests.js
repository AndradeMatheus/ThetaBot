const Discord = require('discord.js');
const config = require('../config');
const axios = require('axios');
const ytdl = require('ytdl-core');
const client = new Discord.Client();
const token = config.configs.auth.token;
const prefix = config.configs.config.prefix;
const botId = '799778892780011530'

const botCommands = {
  [`${prefix}agu`]: handleAgu,
  [`${prefix}instant`]: handleInstant,
  [`${prefix}dilera`]: handleDilera,
  [`${prefix}tey`]: handleTey,
};

async function handleAgu(msg){
  msg.channel.send(new Discord.MessageAttachment(`https://cdn.discordapp.com/attachments/785238813919805451/785707669125464104/unknown.png`));
}

async function handleInstant(msg){
  let search = msg.content.replace(`${prefix}instant `, '');
  let instant = await getMyInstants(msg, search);

  if (msg.member.voice.channel) {
    const connection = await msg.member.voice.channel.join();
    connection.play(instant.sound);
  }
}

async function getMyInstants(msg, search) {
  let query = search.replace(/ /g, "-");
  try{
    const response = await axios.get(`https://www.myinstants.com/api/v1/instants/${query}`)
    if(response.data.sound){
      return response.data;
    } else {
      msg.channel.reply('Nenhum instant encontrado');
    }
  }
  catch(err){
    return err;
  }
}

async function handleDilera(msg){
  const connection = await msg.member.voice.channel.join();
  connection.play("https://www.myinstants.com/media/sounds/buzinaprolongada.mp3");
}

async function handleTey(msg){
  const connection = await msg.member.voice.channel.join();
  connection.play("https://www.myinstants.com/media/sounds/tey-quietinho-bydilera.mp3");
}

client.on('message', async msg => {
  if(msg.author.id != botId && msg.channel.name == 'theta-bot'){
    const command = msg.content.split(' ')[0];
    if (command
      && command in botCommands){
        const fn = botCommands[command];
        await fn(msg);
    }
    
    if(msg.content.includes("bot") && msg.content.includes("funcionand")){
      msg.channel.reply("eu nao to funcionando direito nao seu animal");
    }

    console.log(`${msg.content} do autor ${msg.author.name}`);
  }  
});

client.once('ready', () => {
  console.log(`EAE MACACO!`);
});

client.login(token);