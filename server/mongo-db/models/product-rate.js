import { model, Schema } from 'mongoose';

const ProductRate = new Schema({
  rate: { type: Number, min: 0, max: 10, default: 0, required: true }
});

export default model('ProductRate', ProductRate);
