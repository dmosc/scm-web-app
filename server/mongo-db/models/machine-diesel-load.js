import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';

const MachineDieselLoad = new Schema({
  date: { type: Date, required: true, default: Date.now },
  previousTankIndicator: { type: Number, required: true },
  tankIndicator: { type: Number, required: true },
  horometer: { type: Number, required: true },
  driver: { type: String, required: false },
  machine: { type: Schema.ObjectId, ref: 'Machine', required: true },
  registeredBy: { type: Schema.ObjectId, ref: 'User', required: true }
});

MachineDieselLoad.plugin(softDelete, { deletedAt: true });

export default model('MachineDieselLoad', MachineDieselLoad);
