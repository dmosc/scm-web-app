import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';
import warningReasons from '../../utils/enums/warning-reasons';

const ClientSubscriptionWarning = new Schema({
  tons: { type: Number, min: 0, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  reason: { type: String, enum: [...warningReasons] },
  comments: { type: String },
  subscription: { type: Schema.Types.ObjectId, ref: 'ClientSubscription', required: true },
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

ClientSubscriptionWarning.plugin(softDelete, { deletedAt: true });

export default model('ClientSubscriptionWarning', ClientSubscriptionWarning);
