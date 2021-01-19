# O que é isso?

O ThetaBot é um bot para uso no [Discord](https://discord.com/) criado por mim para fins de estudo e também pra me divertir um pouco com os amigos.

Totalmente baseado na biblioteca própria do Discord, o [Discord.js](https://discord.js.org/#/).

## Instalação

As dependências podem ser instaladas com:

```bash
npm i
```

O guia de como configurar o bot no painel de desenvolvimento do Discord está no [Guia Oficial do DiscordJS](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)

Recomenda-se usar o Heroku para hostear a aplicação, todas as configurações dos dynos estão no arquivo [Procfile](https://github.com/AndradeMatheus/ThetaBot/blob/master/Procfile)

Após subir a aplicação no Heroku como um worker, é necessário adicionar uma chave de enviroment 'BOT_TOKEN' com o valor da Token fornecida pelo painel de desenvolvimento do Discord.

## Uso

A aplicação está em desenvolvimento.

Atualmente a única usabilidade é a pesquisa de sons no [myInstants](http://myinstants.com/) com o comando .inst nome-do-som.

Escreva .help no chat para as demais funcionalidades.

![ThetaBot](https://i.imgur.com/BzxGYHn.png)
