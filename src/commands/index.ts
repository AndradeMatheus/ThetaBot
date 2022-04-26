import { Message, MessageEmbed } from 'discord.js';
import Assets from '../utils/assets';
import Command from '../models/command';
import MyInstantsCommands from './myinstants.commands';
const { BOT_PREFIX: prefix } = process.env;

const handleHelp = async (msg: Message): Promise<void> => {
	const help: { name: string; value: string }[] = [];
	const helpParameter = msg.content.split(' ')[1];

	commands
		.sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0))
		.filter((c) => c.description)
		.forEach((command) => {
			help.push({ name: command.name, value: command.description });
		});

	const helpCommand = commands.find(
		(c) => c.name == `${prefix}${helpParameter}`,
	);

	if (helpCommand) {
		const embed = new MessageEmbed()
			.setTitle(helpCommand.name)
			.setDescription(helpCommand.description)
			.setColor(Assets.theta.color)
			.addFields({
				name: 'Exemplo de uso:',
				value: helpCommand.help
					? `${helpCommand.name} ${helpCommand.help}`
					: 'Este comando não possui parâmetros adicionais',
			})
			.setFooter(helpCommand.help ? 'Desconsidere os \'[ ]\'' : '');

		await msg?.channel?.send(embed);
	}
	else if (helpParameter && !helpCommand) {
		await msg?.reply('esse comando não existe');
	}
	else if (help.length) {
		const embed = new MessageEmbed()
			.setTitle('Help')
			.setColor(Assets.theta.color)
			.addFields(help)
			.setThumbnail(Assets.macacoWakey)
			.setFooter(`---------------------------------------------------------------------
Use .help [comando] para saber mais sobre um comando \nDesconsidere os '[ ]'\n\ngithub.com/AndradeMatheus/ThetaBot`);

		await msg?.channel?.send(embed);
	}
};

const handleLeave = (msg: Message): Promise<void> => {
	msg?.member?.voice?.channel?.leave();
	return Promise.resolve();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPlayer = (msg: Message): any => msg?.guild?.voice?.connection?.player;

const handlePause = async (msg: Message) => {
	const player = getPlayer(msg);
	if (player) player.dispatcher.pause();
};

const handleResume = async (msg: Message) => {
	const player = getPlayer(msg);
	if (player) player.dispatcher.resume();
};

const handleStop = async (msg: Message) => {
	const player = getPlayer(msg);
	if (player) player.dispatcher.destroy();
};

const commands: Command[] = [
	new Command(
		`${prefix}leave`,
		'Remove o bot do canal de voz :(',
		'',
		handleLeave,
	),
	new Command(
		`${prefix}pause`,
		'Pausa a reprodução do aúdio atual',
		'',
		handlePause,
	),
	new Command(`${prefix}resume`, 'Resume o áudio pausado', '', handleResume),
	new Command(`${prefix}stop`, 'Cancela a reprodução do áudio', '', handleStop),
	new Command(`${prefix}help`, 'Help!', '[comando]', handleHelp),

	...MyInstantsCommands,
];

export default commands;
