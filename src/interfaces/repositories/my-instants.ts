import { ICommand } from '../../schemas/command.schema';
import { IServer } from '../../schemas/server.schema';
import { Document } from 'mongoose';

export default interface IMyInstantsRepository {
  getServer(uid: string): Promise<(Document & IServer) | null>;

  createServerCommand(
    serverUid: string,
    commandAlias: string,
    commandValue: string,
  ): Promise<string | null>;

  getCommandByAlias(server: IServer, alias: string): ICommand | undefined;

  deleteServerCommand(
    serverUid: string,
    commandAlias: string,
  ): Promise<string | null>;

  editServerCommand(
    serverUid: string,
    commandAlias: string,
    commandValue: string,
  ): Promise<string | null>;
}
