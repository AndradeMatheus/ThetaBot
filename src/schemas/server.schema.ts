import { Schema, model, Types } from 'mongoose';
import { ICommand, CommandSchema } from './command.schema';

export interface IServer {
    _id: string;
    uid: string,
    commands: Types.Array<ICommand>
}

const ServerSchema = new Schema<IServer>({
    uid: { type: String, required: true },
    commands: { type: [CommandSchema], required: true },
});

export const ServerModel = model<IServer>('servers', ServerSchema)