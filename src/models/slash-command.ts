import { CommandInteraction } from 'discord.js';
import {
  DiscordGatewayAdapterCreator,
  NoSubscriberBehavior,
  VoiceConnection,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from '@discordjs/voice';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/rest/v10/interactions';

export default abstract class SlashCommand {
  constructor(public name: string, public description: string) {
    //
  }

  abstract getSlashCommandJson(): RESTPostAPIApplicationCommandsJSONBody;

  abstract handle(interaction: CommandInteraction): Promise<void>;

  getVoiceChannelConnection = async (
    interaction: CommandInteraction,
  ): Promise<VoiceConnection | null | undefined> => {
    const connection = joinVoiceChannel({
      adapterCreator: interaction.guild
        ?.voiceAdapterCreator as DiscordGatewayAdapterCreator,
      channelId: (interaction.member as any)?.voice?.channelId as string,
      guildId: interaction.guildId as string,
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
