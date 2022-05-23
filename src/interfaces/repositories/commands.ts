import { Document } from 'mongoose';
import { ICommand } from '../../schemas/command.schema';
import { IServer } from '../../schemas/server.schema';

interface ICommandsRepository {
  getServer(uid: string): Promise<(Document & IServer) | null>;

  createServerCommand(
    serverUid: string,
    commandAlias: string,
    commandValue: string,
    type: 'inst' | 'img',
  ): Promise<string | undefined>;

  getCommandByAlias(server: IServer | string | null, alias: string): Promise<ICommand | undefined>;

  getCommands(server: IServer | string | null, type: 'img' | 'inst'): Promise<ICommand[]>;

  deleteServerCommand(
    serverUid: string,
    commandAlias: string,
  ): Promise<string | undefined>;

  editServerCommand(
    serverUid: string,
    commandAlias: string,
    commandValue: string,
    type: 'inst' | 'img',
  ): Promise<string | undefined>;
}


export default ICommandsRepository;
