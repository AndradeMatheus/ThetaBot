import { model, Schema } from 'mongoose';

export interface ICommand {
  _id: string;
  alias: string;
  value: string;
}

export const CommandSchema = new Schema<ICommand>({
  alias: { type: String, required: true },
  value: { type: String, required: true },
});

export const CommandModel = model<ICommand>('commands', CommandSchema);
