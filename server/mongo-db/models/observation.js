import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';

const Observation = new Schema({
  start: { type: Date, required: true, default: Date.now },
  end: { type: Date },
  description: { type: String, default: '' },
  lap: { type: Schema.ObjectId, ref: 'Lap', required: true }
});

Observation.plugin(softDelete, { deletedAt: true });

export default model('Observation', Observation);