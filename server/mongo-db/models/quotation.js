import { Schema, model } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import softDelete from 'mongoose-delete';

const QuotedProduct = new Schema({
  price: { type: Number, required: true },
  rock: { type: Schema.ObjectId, required: true, ref: 'Rock' },
  freight: { type: Number }
});

const Quotation = new Schema({
  name: { type: String, required: true },
  businessName: { type: String },
  products: [{ type: QuotedProduct, required: true }],
  validUntil: { type: Date, required: true },
  folio: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: 'User', required: true },
  hasFreight: { type: Boolean, default: false, required: true }
});

Quotation.plugin(softDelete, { deletedAt: true });
Quotation.plugin(uniqueValidator);

export default model('Quotation', Quotation);
