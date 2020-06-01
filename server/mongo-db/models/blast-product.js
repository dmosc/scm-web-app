import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';

const BlastProduct = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true }
});

BlastProduct.plugin(softDelete, { deletedAt: true });

export default model('BlastProduct', BlastProduct);
