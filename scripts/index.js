const Discord = require('discord.js');
const { config, auth } = require('../config');
const client = new Discord.Client();
const commands = require('./commands');

client.on('message', async msg => {
  if(msg.author.id != config.botId && msg.channel.name == 'theta-bot'){
    const commandName = msg.content.split(' ')[0];
    if (commandName
      && commandName in commands){
        const cmd = commands[commandName];
        await cmd.execute(msg);
    }
    
    if(msg.content.includes("bot") && msg.content.includes("funcionand")){
      msg.reply("eu nao to funcionando direito nao seu animal");
    }

    console.log(`${msg.content} do autor ${msg.author.name}`);
  }  
});

client.once('ready', () => {
  console.log(`EAE MACACO!`);
});

client.login(auth.token);