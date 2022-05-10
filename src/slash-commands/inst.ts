import { BaseCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import axios from 'axios';
import {
	RESTPostAPIApplicationCommandsJSONBody,
	Routes,
} from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import IMyInstantResponse from 'interfaces/IMyInstantResponse';
import SlashCommand, { CommandHandlerType } from 'models/slash-command';
import logger from '../utils/logger';
const { BOT_TOKEN, BOT_CLIENTID } = process.env;

import * as myInstantsRepository from '../repositories/myinstants-repository';
export default class MyInstantsSlashCommand extends SlashCommand {
	constructor() {
		super(
			'inst',
			'MyInstants commands',
			'/inst {play | create | edit | delete}',
		);
	}

	getSlashCommandJson(): RESTPostAPIApplicationCommandsJSONBody {
		return new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.addSubcommand((play) =>
				play
					.setName('play')
					.setDescription('play a MyInstant audio by name/url')
					.addStringOption((opt) =>
						opt
							.setName('value')
							.setDescription('MyInstant audio name or full url')
							.setRequired(true),
					),
			)
			.addSubcommand(create =>
				create
					.setName('create')
					.setDescription('create a custom MyInstant command')
					.addStringOption(name =>
						name
							.setName('name')
							.setDescription('command name')
							.setRequired(true),
					)
					.addStringOption(value =>
						value
							.setName('value')
							.setDescription('MyInstant\' name/url that will be played')
							.setRequired(true),
					)
					.addStringOption(description =>
						description
							.setName('description')
							.setDescription('audio description')
							.setRequired(false),
					),
			)
			.toJSON();
	}

	private async getMyInstants(
		search: string,
	): Promise<IMyInstantResponse | null> {
		const query = search.replace(/ /g, '-');
		try {
			const response = await axios.get<IMyInstantResponse>(
				`https://www.myinstants.com/api/v1/instants/${query}`,
			);

			return response.data;
		}
		catch (err: any) {
			logger.error(
				`there was an error while searching myinstant '${query}': ${err.message}`,
			);
			return null;
		}
	}

	handle = async (
		interaction: BaseCommandInteraction,
		commandArgs: CommandHandlerType,
	): Promise<void> => {
		await interaction.deferReply();
		// @ts-ignore
		const subCommandName = interaction.options.getSubcommand() as string;
		const subcommands = new Map<
      string,
      (
        fnInteraction: BaseCommandInteraction,
        fnCommandArgs: CommandHandlerType
      ) => Promise<void>
    >();
		subcommands.set('play', this.handlePlay);
		subcommands.set('create', this.handleCreate);

		if (!subcommands.has(subCommandName)) {
			await interaction.editReply(`invalid command '${subCommandName}'`);
			return;
		}

		const action = subcommands.get(subCommandName);

		// @ts-ignore
		await action(interaction, commandArgs);
		await interaction.editReply('done');
	};

	handlePlay = async (interaction: BaseCommandInteraction) => {
		const option = interaction.options.get('value');
		const instantSearch = this.extractSearch(option?.value as string);
		await this.handleInstantPlay(interaction, instantSearch);
	};

	private handleInstantPlay = async (
		interaction: BaseCommandInteraction,
		instantSearch: string,
	) => {
		const instant = await this.getMyInstants(instantSearch);

		if (!instant?.sound) {
			interaction.editReply('instant not found');
			return;
		}

		const connection = await this.getVoiceChannelConnection(interaction);

		if (!connection) {
			interaction.editReply('voice channel not found');
			return;
		}

		await this.connectToVoiceChannelAndPlay(connection, instant.sound);

		const FIVE_MINUTES_IN_MILISECONDS = 5 * 60 * 1000;
		setTimeout(() => connection.disconnect(), FIVE_MINUTES_IN_MILISECONDS);
	};

	handleCreate = async (interaction: BaseCommandInteraction) => {
		// extract command name, value and description
		const nameOption = interaction.options.get('name', true);
		const valueOption = interaction.options.get('value', true);
		const commandDescriptionOption = interaction.options.get(
			'description',
			false,
		);
		const search = this.extractSearch(valueOption?.value as string);
		const commandName = nameOption?.value as string;
		const commandDescription = commandDescriptionOption?.value;

		// create slash command
		await this.createIntantSlashCommand(
			interaction,
			commandName,
      commandDescription as string,
		);

		// create command with value on mongodb
		const commandCreationError = await myInstantsRepository.createServerCommand(
      interaction.guildId as string,
      commandName,
      search,
		);

		if (commandCreationError) {
			logger.info(
				`the was an error while creating command ${commandName} on server '${interaction.guild?.name}': ${commandCreationError}`,
			);
			await interaction.editReply('ocorreu um erro ao criar esse comando');
			return;
		}

		// reply with success
		logger.info(
			`command '${commandName}' created successfully on server '${interaction.guild?.name}'`,
		);
		await interaction.editReply(`comando '${commandName}' criado com sucesso`);
	};

	handleCustomInstant = async (interaction: BaseCommandInteraction) => {
		// get command from mongodb
		const server = await myInstantsRepository.getServer(interaction.guildId as string);

		if (!server) {
			await interaction.reply('ocorreu um erro ao buscar esse comando');
			logger.info(`command '${interaction.commandName}' not found on server '${interaction.guild?.name} (${interaction.guildId})'`);
			return;
		}

		const dbCommand = myInstantsRepository.getCommandByAlias(server, interaction.commandName);

		if (dbCommand) {
			// play sound
			await this.handleInstantPlay(interaction, dbCommand.value);
			await interaction.reply('done');
		}
	};

	private createIntantSlashCommand = async (
		interaction: BaseCommandInteraction,
		commandName: string,
		commandDescription: string | undefined,
	) => {
		const newSlashcommand = new SlashCommandBuilder().setName(commandName);

		if (commandDescription) {
			newSlashcommand.setDescription(commandDescription as string);
		}

		const rest = new REST({ version: '10' }).setToken(BOT_TOKEN!);
		await rest.put(
			Routes.applicationGuildCommands(
        BOT_CLIENTID!,
        interaction.guildId as string,
			),
			{
				body: [newSlashcommand.toJSON()],
			},
		);
	};

	private extractSearch = (input: string): string => {
		const search = input.includes('myinstants.com')
			? input
				.replace('https://', '')
				.replace('http://', '')
				.replace('www.', '')
				.replace('myinstants.com/instant/', '')
				.replace('/', '')
			: input.replace('/', '');

		return search;
	};
}
