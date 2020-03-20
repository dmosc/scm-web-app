import { Schema, model } from 'mongoose';
import softDelete from 'mongoose-delete';

const ClientPrice = new Schema({
  client: { type: Schema.ObjectId, ref: 'Client', required: true },
  rock: { type: Schema.ObjectId, ref: 'Rock', required: true },
  price: { type: Number, required: true },
  addedAt: { type: Date, required: true, default: Date.now },
  setBy: { type: Schema.ObjectId, ref: 'User', required: true }
});

ClientPrice.plugin(softDelete, { deletedAt: true });

export default model('ClientPrice', ClientPrice);
