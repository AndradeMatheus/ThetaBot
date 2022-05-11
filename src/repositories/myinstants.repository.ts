import { injectable } from 'tsyringe';
import IMyInstantsRepository from 'interfaces/repositories/my-instants';
import { Document } from 'mongoose';
import { ICommand, CommandModel } from '../schemas/command.schema';
import { ServerModel, IServer } from '../schemas/server.schema';

@injectable()
export default class MyInstantsRepository implements IMyInstantsRepository {
  getServer = async (
    uid: string,
  ): Promise<(Document & IServer) | null> => {
    const server = await ServerModel.findOne<Document & IServer>({ uid })
      .populate('commands')
      .exec();

    return server;
  };

  createServerCommand = async (
    serverUid: string,
    commandAlias: string,
    commandValue: string,
  ): Promise<string | null> => {
    const existingServer = await this.getServer(serverUid);
    const commandModel = new CommandModel({
      alias: commandAlias,
      value: commandValue,
    });

    if (!existingServer) {
      const newServer = new ServerModel({
        uid: serverUid,
        commands: [commandModel],
      });
      newServer.save();
    } else {
      const existingCommand = this.getCommandByAlias(existingServer, commandAlias);

      if (existingCommand) {
        return `the alias '${commandAlias}' already exists on server ${serverUid}`;
      }

      existingServer.commands.push(commandModel);
      existingServer.save();
    }

    return null;
  };

  getCommandByAlias(
    server: IServer,
    alias: string,
  ): ICommand | undefined {
    return server?.commands?.find((c) => c.alias == alias);
  };

  deleteServerCommand = async (
    serverUid: string,
    commandAlias: string,
  ): Promise<string | null> => {
    const server = await this.getServer(serverUid);

    if (!server) {
      return `server '${serverUid}' not found`;
    }

    const command = this.getCommandByAlias(server, commandAlias);

    if (!command) {
      return `command '${commandAlias}' not found on server ${serverUid}`;
    }

    server.commands.pull(command._id);
    server.save();

    return null;
  };

  editServerCommand = async (
    serverUid: string,
    commandAlias: string,
    commandValue: string,
  ): Promise<string | null> => {
    const server = await this.getServer(serverUid);
    const deleteCommandError = await this.deleteServerCommand(serverUid, commandAlias);

    if (deleteCommandError) {
      return deleteCommandError;
    } else {
      server?.commands.push(
        new CommandModel({ alias: commandAlias, value: commandValue }),
      );
      server?.save();
    }

    return null;
  };
}
