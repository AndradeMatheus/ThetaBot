import { myInstantsCommands } from './myinstants.commands';
import customCommands from './custom.commands';
import playerCommands from './player.commands';

const commands = [
    ...customCommands,
    ...myInstantsCommands,
    ...playerCommands
]

module.exports = commands;