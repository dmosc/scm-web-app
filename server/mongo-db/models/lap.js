import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';

const Lap = new Schema({
  start: { type: Date, required: true, default: Date.now },
  end: { type: Date },
  tons: { type: Number, required: true },
  driver: { type: Schema.ObjectId, ref: 'User', required: true },
  machine: { type: Schema.ObjectId, ref: 'Machine', required: true },
  turn: { type: Schema.ObjectId, ref: 'ProductionTurn' },
  observations: [{ type: Schema.ObjectId, ref: 'Observation', required: true, default: [] }]
});

Lap.plugin(softDelete, { deletedAt: true });

export default model('Lap', Lap);
