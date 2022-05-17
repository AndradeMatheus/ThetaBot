![ThetaBot](https://i.imgur.com/rQEYFnt.png)

## O que é isso?

O ThetaBot é um bot para uso no [Discord](https://discord.com/) criado por mim e com a contribuição do [Lucas](https://github.com/lucasvsouza28) para fins de estudo e também pra me divertir um pouco com os amigos.

Totalmente baseado na biblioteca própria do Discord, o [Discord.js](https://discord.js.org/#/).

O nosso histórico de implementações, idéias e vontades para implementações futuras, estão no nosso [Trello](https://trello.com/b/bArWp6KZ/thetabot)

Quer convidar o nosso bot para o seu Discord? [Clique neste link](https://discord.com/oauth2/authorize?client_id=799778892780011530&scope=bot). O bot ainda não está completo, então sinta-se à vontade para testar :) qualquer dúvida, escreva uma issue, entre em contato comigo no discord (Tetis#1234) ou no [nosso servidor](https://discord.gg/mnXbckAU)!

## Instalação

As dependências podem ser instaladas com:

```bash
npm i
```

O guia de como configurar o bot no painel de desenvolvimento do Discord está no [Guia Oficial do DiscordJS](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)

Recomenda-se usar o Heroku para hostear a aplicação, todas as configurações dos dynos estão no arquivo [Procfile](https://github.com/AndradeMatheus/ThetaBot/blob/master/Procfile)

Algumas variáveis de ambiente estão baseadas no node.env, elas serão definidas no host da sua aplicação, como abaixo:

```bash
BOT_TOKEN="TOKEN" #(fornecido pelo painel de admnistrador do Discord)
BOT_CLIENTID="ClientId" #(fornecido pelo painel de admnistrador do Discord)
MONGO_URI="" #Uri para conexão com mongodb
```

Caso o deploy seja feito no Heroku, há um guia para utilizar as [config vars](https://devcenter.heroku.com/articles/config-vars).

## Comandos

Confira abaixo os comandos disponíveis atualmente no bot:

| Comando | Sub-comando | Descrição do comando | Parâmetros |
|---------|-------------|----------------------|------------|
| /agu    |             | Exibe retrato verossímil de Lucão e Ninext |
| /dilera |             | Uh uh uuuuuuhh       |            |
| /img    |             | Busca imagem no google images | ``query``: texto para buscar a imagem |
| /info   | list-servers | Mostra a lista dos servidores em que o bot está instalado |
| /inst   | play        | Busca e reproduz o MyInstant no canal de voz em que o usuário estiver conectado | ``*name``: texto/url do MyInstant |
| /inst   | create      | Cria um comando de barra para um MyInstant. Ex: /macaco | ``*name``: nome do comando (ex: macaco); ``*value``: texto/url do MyInstant; ``description``: descrição do comando |
| /inst   | edit        | Edita um comando de barra criado anteriormente | ``*name``: nome do comando; ``*value``: texto/url do MyInstant; ``description``: descrição do comando |
| /inst   | delete      | Remove um comando de barra criado anteriormente | ``*name``: nome do comando |
| /inst   | list        | Lista os comandos de barra criados ||
| /ping   |             | PONG                               |

> Os parâmetros marcados com * são obrigatórios

> A aplicação está em desenvolvimento.

## Licenças

[Discord libraries](https://discord.com/licenses)

[MyInstants TOF](https://www.myinstants.com/terms_of_use.html)
