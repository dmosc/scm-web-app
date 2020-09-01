import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';

const BoreHole = new Schema({
  folio: { type: String, required: true },
  date: { type: Date, required: true },
  meters: { type: Number, min: 0, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  machine: { type: Schema.Types.ObjectId, ref: 'Machine', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

BoreHole.plugin(softDelete, { deletedAt: true });

export default model('BoreHole', BoreHole);
