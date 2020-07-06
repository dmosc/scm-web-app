import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';

const ProductionTurn = new Schema({
  folio: { type: String, required: false, index: true },
  start: { type: Date, required: true, default: Date.now },
  end: { type: Date },
  laps: [{ type: Schema.ObjectId, ref: 'Lap', required: true, default: [] }]
});

ProductionTurn.plugin(softDelete, { deletedAt: true });

export default model('ProductionTurn', ProductionTurn);