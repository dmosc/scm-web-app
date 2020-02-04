import { Schema, model } from 'mongoose';

const Truck = new Schema({
  plates: { type: String, required: true, unique: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  weight: { type: Number, required: true },
  client: { type: Schema.ObjectId, ref: 'Client', required: true },
  drivers: [{ type: String, required: true, default: [] }]
});

export default model('Truck', Truck);
