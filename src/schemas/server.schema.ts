import { Schema, Types, model } from 'mongoose';

export interface ICommand {
  _id?: string;
  alias: string;
  value: string;
  $type: 'inst' | 'img';
}

export interface IServer {
  _id: string;
  uid: string;
  commands: Types.Array<ICommand>;
}

const ServerSchema = new Schema<IServer>({
  uid: { type: String, required: true },
  commands: [{ alias: String, value: String, $type: String }],
  // { type: [CommandSchema], required: true },
});

export const ServerModel = model<IServer>('servers', ServerSchema);
