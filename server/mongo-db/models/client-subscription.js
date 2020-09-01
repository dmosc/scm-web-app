import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';

const ClientSubscription = new Schema({
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  days: { type: Number, min: 0, required: true },
  tons: { type: Number, min: 0, required: true },
  margin: { type: Number, min: 0, max: 1, required: true },
  start: { type: Date, required: true, default: Date.now },
  end: { type: Date, required: true },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isWarningActive: { type: Boolean, required: true, default: false }
});

ClientSubscription.plugin(softDelete, { deletedAt: true });

export default model('ClientSubscription', ClientSubscription);
