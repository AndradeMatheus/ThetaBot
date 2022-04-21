import dotenv from 'dotenv'
dotenv.config();

import { Client, Message } from 'discord.js';
import Commands from './commands';
import { getInstantAlias } from './commands/myinstants.commands';
import './utils/startDb.ts';

const { BOT_TOKEN: token } = process.env;

const client = new Client({
  restTimeOffset: 25
});

client.on('message', async (msg: Message) => {
  if(!msg?.author?.bot){
    const commandName = msg?.content?.split(' ')[0];
    if (commandName){
        const command = Commands.find(c => c.name === commandName);

        if (command) await command.execute(msg, client);
        else getInstantAlias(commandName, msg);
    }

    if(msg?.content.includes("bot") && msg?.content?.includes("funcion")){
      msg?.reply("eu nao to funcionando direito nao seu animal");
    }
  }  
});

client.once('ready', () => {
  client?.user?.setActivity('.help', { 
    type: 'STREAMING',
    url: 'http://twitch.tv/tetistiger' 
  })

  console.log(`EAE MACACO!`);
});

client.login(token);
