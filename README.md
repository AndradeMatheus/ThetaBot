## O que é isso?

O ThetaBot é um bot para uso no [Discord](https://discord.com/) criado por mim e com a contribuição do [Lucas](https://github.com/lucasvsouza28) para fins de estudo e também pra me divertir um pouco com os amigos.

Totalmente baseado na biblioteca própria do Discord, o [Discord.js](https://discord.js.org/#/).

O nosso histórico de implementações, idéias e vontades para implementações futuras, estão no nosso [Trello](https://trello.com/b/bArWp6KZ/thetabot)

## Instalação

As dependências podem ser instaladas com:

```bash
npm i
```

O guia de como configurar o bot no painel de desenvolvimento do Discord está no [Guia Oficial do DiscordJS](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)

Recomenda-se usar o Heroku para hostear a aplicação, todas as configurações dos dynos estão no arquivo [Procfile](https://github.com/AndradeMatheus/ThetaBot/blob/master/Procfile)

Algumas variáveis de ambiente estão baseadas no node.env, elas serão definidas no host da sua aplicação, como abaixo:

```bash
BOT_TOKEN="TOKEN" #Token fornecida pelo painel de admnistrador do Discord
BOT_PREFIX="." #Prefixo para utilizar os comandos do bot, à vontade do usuário
```

Caso o deploy seja feito no Heroku, há um guia para utilizar as [config vars](https://devcenter.heroku.com/articles/config-vars).

## Uso

A aplicação está em desenvolvimento.

Atualmente as funcionalidades principais são o uso, reprodução e manipulação dos botões/sons do [MyInstants](https://www.myinstants.com/index/br/), com os comandos abaixo:

* .inst nome do som - Utiliza a api aberta do MyInstants para pesquisar e reproduzir um som a partir do bot no canal de voz em que o usuário está.

* inst.create alias url-do-som - Define um alias para algum som do MyInstants, podendo chamar o som apenas com o comando .nome-do-alias

* inst.list - Lista todos os aliases criados no servidor e quais sons irá reproduzir

Escreva .help no chat para as demais funcionalidades.

![ThetaBot](https://i.imgur.com/rQEYFnt.png)

## Licenças

[Discord libraries](https://discord.com/licenses)

[MyInstants TOF](https://www.myinstants.com/terms_of_use.html)
