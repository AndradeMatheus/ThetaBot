const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../config');
const token = config.configs.auth.token;
const prefix = config.configs.config.prefix;
const botId = '799778892780011530'
const axios = require('axios');
const ytdl = require('ytdl-core');

client.once('ready', () => {
  console.log(`EAE MACACO!`);
});

client.on('message', async msg => {
  if(msg.author.id != botId && msg.channel.name == 'theta-bot'){
    if(msg.content.startsWith(`${prefix}agu`)){
      msg.channel.send(new Discord.MessageAttachment(`https://cdn.discordapp.com/attachments/785238813919805451/785707669125464104/unknown.png`))
    }
    else if(msg.content.startsWith(`${prefix}macaco-instants`)){
      let search = msg.content.replace(`${prefix}macaco-instants `, "");
      let instant = await getMyInstants(search);
      if (msg.member.voice.channel) {
        const connection = await msg.member.voice.channel.join();
        connection.play(instant.sound);
      }
    }
    else{
      msg.channel.send("eu nao to funcionando direito nao seu animal")
    }
  }
  console.log(`${msg.content} do autor ${msg.author.name}`)
});

async function getMyInstants(search) {
  let query = search.replace(/ /g, "-");
  try{
    const response = await axios.get(`https://www.myinstants.com/api/v1/instants/${query}`)
    if(response.data.sound){
      return response.data;
    }
  }
  catch(err){
    return err;
  }
}

client.login(token);