import { IServer, ICommand, ServerModel } from '../schemas/server.schema';
import { Document } from 'mongoose';
import ICommandsRepository from 'interfaces/repositories/commands';
import { injectable } from 'tsyringe';

@injectable()
export default class CommandsRepository implements ICommandsRepository {
  getServer = async (uid: string): Promise<(Document & IServer) | null> => {
    const server = await ServerModel.findOne<Document & IServer>({ uid })
      .populate('commands')
      .exec();

    return server;
  };

  createServerCommand = async (
    serverUid: string,
    commandAlias: string,
    commandValue: string,
    type: 'inst' | 'img',
  ): Promise<string | undefined> => {
    const existingServer = await this.getServer(serverUid);
    const command: ICommand = {
      alias: commandAlias,
      value: commandValue,
      $type: type,
    };

    if (!existingServer) {
      const newServer = new ServerModel({
        uid: serverUid,
        commands: [command],
      });
      newServer.save();
    } else {
      const existingCommand = await this.getCommandByAlias(
        existingServer,
        commandAlias,
      );

      if (existingCommand) {
        return `the alias '${commandAlias}' already exists on server ${serverUid}`;
      }

      existingServer.commands.push(command);
      existingServer.save();
    }
  };

  async getCommandByAlias(
    server: IServer | string | null,
    alias: string,
  ): Promise<ICommand | undefined> {
    let existingServer: IServer | null = null;

    if (!server) return;

    if (typeof server === 'string') {
      existingServer = await this.getServer(server as string);
    } else {
      existingServer = server as IServer;
    }

    return existingServer?.commands?.find((c) => c.alias == alias);
  }

  getCommands = async (
    server: string | IServer | null,
    type: 'img' | 'inst',
  ): Promise<ICommand[]> => {
    let existingServer: IServer | null = null;

    if (!server) return [];

    if (typeof server === 'string') {
      existingServer = await this.getServer(server as string);
    } else {
      existingServer = server as IServer;
    }

    return existingServer?.commands?.filter((c) => c.$type === type) ?? [];
  };

  deleteServerCommand = async (
    serverUid: string,
    commandAlias: string,
  ): Promise<string | undefined> => {
    const server = await this.getServer(serverUid);

    if (!server) {
      return `server '${serverUid}' not found`;
    }

    const command = await this.getCommandByAlias(server, commandAlias);

    if (!command) {
      return `command '${commandAlias}' not found on server ${serverUid}`;
    }

    server.commands.pull(command._id);
    server.save();
  };

  editServerCommand = async (
    serverUid: string,
    commandAlias: string,
    commandValue: string,
    type: 'inst' | 'img',
  ): Promise<string | undefined> => {
    const server = await this.getServer(serverUid);
    const deleteCommandError = await this.deleteServerCommand(
      serverUid,
      commandAlias,
    );

    if (deleteCommandError) {
      return deleteCommandError;
    } else {
      server?.commands.push({ alias: commandAlias, value: commandValue, type });
      server?.save();
    }
  };
}
