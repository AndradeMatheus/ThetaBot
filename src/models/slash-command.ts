import { Client, BaseCommandInteraction } from 'discord.js';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/rest/v10/interactions';
import {
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
	NoSubscriberBehavior,
	VoiceConnection,
} from '@discordjs/voice';

export type CommandHandlerType = Client | undefined | string;

export default abstract class SlashCommand {
	constructor(
    public name: string,
    public description: string,
    public help: string = 'N/A',
	) {}

  abstract getSlashCommandJson(): RESTPostAPIApplicationCommandsJSONBody;

  abstract handle(
    interaction: BaseCommandInteraction,
    client: CommandHandlerType
  ): Promise<void>;

  getVoiceChannelConnection = async (
  	interaction: BaseCommandInteraction,
  ): Promise<VoiceConnection | null | undefined> => {
  	const connection = joinVoiceChannel({
  		// @ts-ignore
  		adapterCreator: interaction.guild?.voiceAdapterCreator,
  		// @ts-ignore
  		channelId: interaction.member?.voice?.channelId!,
  		guildId: interaction.guildId!,
  	});

  	return connection;
  };

  connectToVoiceChannelAndPlay = async (
  	connection: VoiceConnection,
  	audio: string,
  ): Promise<void> => {
  	const player = createAudioPlayer({
  		behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
  	});
  	connection?.subscribe(player);
  	const audioResource = createAudioResource(audio);
  	player.play(audioResource);
  };
}
