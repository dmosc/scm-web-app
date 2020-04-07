import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';

const TankDieselLoad = new Schema({
  date: { type: Date, required: true, default: Date.now },
  tankIndicator: { type: Number, required: true },
  load: { type: Number, required: true },
  reference: { type: String, required: false },
  comments: { type: String, required: false },
  registeredBy: { type: Schema.ObjectId, ref: 'User', required: true }
});

TankDieselLoad.plugin(softDelete, { deletedAt: true });

export default model('TankDieselLoad', TankDieselLoad);
