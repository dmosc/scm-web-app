import { Schema, model } from 'mongoose';
import softDelete from 'mongoose-delete';
import periods from '../enums/periods';

const Turn = new Schema({
  user: { type: Schema.ObjectId, ref: 'User', required: true },
  start: { type: Date, required: true },
  end: { type: Date },
  period: { type: String, enum: [...periods], required: true },
  folios: [{ type: String, required: true, default: [] }]
});

Turn.plugin(softDelete, { deletedBy: true });

export default model('Turn', Turn);
