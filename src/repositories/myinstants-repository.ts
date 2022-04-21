import { ICommand } from './../schemas/command.schema';
import { Document } from 'mongoose';
import { ServerModel, IServer } from '../schemas/server.schema';
import { CommandModel } from '../schemas/command.schema';

export const getServer = async (uid: string): Promise<Document & IServer> => {
    const server = await ServerModel.findOne<Document & IServer>({ uid }).populate('commands').exec()

    return server;
}

export const createServerCommand = async(serverUid: string, commandAlias: string, commandValue: string): Promise<string | null> => {
    const existingServer = await getServer(serverUid);
    const commandModel = new CommandModel({ alias: commandAlias, value: commandValue });

    if (!existingServer) {
        const newServer = new ServerModel({ uid: serverUid, commands: [commandModel] });
        newServer.save();
    }
    else {
        
        const existingCommand = existingServer.commands.find(c => c.alias == commandAlias)

        if (existingCommand){
            return `the alias '${commandAlias}' already exists on server ${serverUid}`;
        }

        existingServer.commands.push(commandModel)
        existingServer.save()
    }

    return null;
}

export const getCommandByAlias = (server: IServer, alias: string): ICommand | undefined => server?.commands?.find(c => c.alias == alias);

export const deleteServerCommand = async (serverUid: string, commandAlias: string): Promise<string | null> => {
    const server = await getServer(serverUid);

    if (!server) {
        return `server '${serverUid}' not found`;
    }

    const command = getCommandByAlias(server, commandAlias);

    if (!command) {
        return `command '${commandAlias}' not found on server ${serverUid}`;
    }

    server.commands.pull(command._id);
    server.save();

    return null;
}

export const editServerCommand = async(serverUid: string, commandAlias: string, commandValue: string): Promise<string | null> => {
    const server = await getServer(serverUid);
    const deleteCommandError = await deleteServerCommand(serverUid, commandAlias)

    if (deleteCommandError) {
        return deleteCommandError;
    }
    else {
        server.commands.push(new CommandModel({ alias: commandAlias, value: commandValue }));    
        server.save();
    }

    return null;
}