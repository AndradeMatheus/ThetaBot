import { SlashCommandBuilder } from '@discordjs/builders';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { BaseCommandInteraction, CacheType } from 'discord.js';
import SlashCommand from 'models/slash-command';
import Assets from '../utils/assets';

export default class DileraSlashCommand extends SlashCommand {
	constructor() {
		super('dilera', 'uh uh uh');
	}

	getSlashCommandJson(): RESTPostAPIApplicationCommandsJSONBody {
		return new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.toJSON();
	}

	async handle(interaction: BaseCommandInteraction<CacheType>): Promise<void> {
		const connection = await this.getVoiceChannelConnection(interaction);

		if (!connection) {
			interaction.reply({
				ephemeral: true,
				data: { content: 'can\'t connect to voice channel' },
			});
			return;
		}

		await this.connectToVoiceChannelAndPlay(
			connection,
			Assets.dileraBuzina,
		);
	}
}
