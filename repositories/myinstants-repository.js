const { ServerModel } = require('../schemas/server.schema')
const { CommandModel } = require('../schemas/command.schema')

const getServer = async (uid) => {
    const server = await ServerModel.findOne({ uid }).populate('commands').exec()

    return server;
}

const createServerCommand = async(serverUid, commandAlias, commandValue) => {
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
}

const getCommandByAlias = (server, alias) => !server.commands ? null : server.commands.find(c => c.alias == alias);

const deleteServerCommand = async (serverUid, commandAlias) => {
    const server = await getServer(serverUid);

    if (!server) {
        return `server '${serverUid}' not found`;
    }

    const command = getCommandByAlias(server, commandAlias);

    if (!command) {
        return `command '${commandAlias}' not found on server ${serverUid}`;
    }

    server.commands.pull(command._id);
    server.save()
}

const editServerCommand = async(serverUid, commandAlias, commandValue) => {
    const server = await getServer(serverUid);
    const deleteCommandError = await deleteServerCommand(serverUid, commandAlias)

    if (deleteCommandError) {
        return deleteCommandError;
    }
    else {
        server.commands.push(new CommandModel({ alias: commandAlias, value: commandValue }));    
        server.save();
    }
}

module.exports = {
    getServer,
    createServerCommand,
    deleteServerCommand,
    editServerCommand
}