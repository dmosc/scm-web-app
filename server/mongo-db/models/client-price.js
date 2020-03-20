import { Schema, model } from 'mongoose';
import softDelete from 'mongoose-delete';

const ClientPrice = new Schema({
  client: { type: Schema.ObjectId, ref: 'Client', required: true },
  rock: { type: Schema.ObjectId, ref: 'Rock', required: true },
  price: { type: Number, required: true, default: -1 },
  addedAt: { type: Date, required: true, default: Date.now },
  setBy: { type: Schema.ObjectId, ref: 'User', required: true },
  // Since the 'active' price will be the most recent, the noSpecialPrice flag
  // will create a more recent state indicating NO SPECIAL PRICE
  // without loosing history changes
  noSpecialPrice: { type: Boolean, required: true, default: false }
});

ClientPrice.plugin(softDelete, { deletedAt: true });

export default model('ClientPrice', ClientPrice);
