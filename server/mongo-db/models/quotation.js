import { Schema, model } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import softDelete from 'mongoose-delete';

const QuotedProduct = new Schema({
  price: { type: Number, required: true },
  rock: { type: Schema.ObjectId, required: true, ref: 'Rock' }
});

const Quotation = new Schema({
  name: { type: String, required: true },
  client: { type: String, required: true },
  products: [QuotedProduct],
  validUntil: { types: Date },
  createdAt: { type: Date, default: Date.now },
  freight: { type: Number, default: 0 }
});

Quotation.plugin(softDelete, { deletedAt: true });
Quotation.plugin(uniqueValidator);

export default model('Quotation', Quotation);
