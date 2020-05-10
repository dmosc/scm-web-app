import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';
import disable from 'mongoose-disable';

const ProductPromotion = new Schema({
  rock: { type: Schema.Types.ObjectId, ref: 'Rock', required: true },
  price: { type: Number, required: true }
});

const Promotion = new Schema({
  name: { type: String, required: true },
  start: { type: Date, required: false },
  end: { type: Date, required: false },
  limit: { type: Number, required: false },
  currentLimit: { type: Number, required: false },
  credit: { type: Boolean, required: false },
  bill: { type: Boolean, required: false },
  product: { type: ProductPromotion, required: true },
  clients: [{ type: Schema.Types.ObjectId, ref: 'Client', required: false }],
  groups: [{ type: Schema.Types.ObjectId, ref: 'ClientsGroup', required: false }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

Promotion.plugin(softDelete, { deletedAt: true });
Promotion.plugin(disable, { disabledAt: true });

export default model('Promotion', Promotion);
