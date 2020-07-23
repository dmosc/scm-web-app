import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';

const SupplyTransactionIn = new Schema({
  date: { type: Date, required: true },
  supply: { type: Schema.Types.ObjectId, ref: 'Supply', required: true },
  quantity: { type: Number, required: true, min: 0 },
  comment: { type: String, required: true, default: '' },
  isAdjustment: { type: Boolean, required: true, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, required: true, default: Date.now }
});

SupplyTransactionIn.plugin(softDelete, { deletedAt: true });

export default model('SupplyTransactionIn', SupplyTransactionIn);
