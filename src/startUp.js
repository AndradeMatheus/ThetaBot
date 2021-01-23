require('dotenv').config()
import * as Discord from 'discord.js';
import commands from './commands';
import { getInstantAlias } from './commands/myinstants.commands';
const { BOT_ID: botId, BOT_TOKEN: token } = process.env;
const client = new Discord.Client({
  restTimeOffset: 25
});

client.on('message', async msg => {
  if(msg.author.id != botId && msg.channel.name.startsWith('theta-bot')){
    const commandName = msg.content.split(' ')[0];
    if (commandName){
        const cmd = commands.find(c => c.name === commandName);

        if (cmd) await cmd.execute(msg);
        else getInstantAlias(commandName, msg);
    }

    if(msg.content.includes("bot") && msg.content.includes("funcion")){
      msg.reply("eu nao to funcionando direito nao seu animal");
    }

    console.log(`${msg.content} do autor ${msg.author.username}`);
  }  
});

client.once('ready', () => {
  console.log(`EAE MACACO!`);
});

client.login(token);