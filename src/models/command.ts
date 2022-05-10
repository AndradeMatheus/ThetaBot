import { Client, Message } from 'discord.js';

export type CommandHandlerType = Client | undefined | string;
export default class Command {
  public execute: (
    message: Message,
    client: CommandHandlerType
  ) => Promise<void>;

  constructor(
    public name: string,
    public description: string,
    public help: string,
    public handler: (
      message: Message,
      client: CommandHandlerType
    ) => Promise<void>
  ) {
    this.execute = handler;
  }
}
