import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';

const Product = new Schema({
  product: { type: Schema.ObjectId, required: true, ref: 'BlastProduct' },
  price: { type: Number, min: 0, required: true },
  quantity: { type: Number, min: 0, required: true }
});

const Blast = new Schema({
  date: { type: Date, required: false },
  products: [{ type: Product, required: true, default: [] }],
  documents: [{ type: String, required: false, default: [] }],
  tons: { type: Number, min: 0, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

Blast.plugin(softDelete, { deletedAt: true });

export default model('Blast', Blast);
