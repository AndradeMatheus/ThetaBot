import { myInstantsCommands } from './myinstants.commands';
import customCommands from './custom.commands';
import playerCommands from './player.commands';

export default [
    ...customCommands,
    ...myInstantsCommands,
    ...playerCommands
]