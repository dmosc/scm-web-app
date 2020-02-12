import { Schema, model } from 'mongoose';
import softDelete from 'mongoose-delete';
import uniqueValidator from 'mongoose-unique-validator';

const Truck = new Schema({
  plates: { type: String, required: true, unique: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  weight: { type: Number, required: true },
  client: { type: Schema.ObjectId, ref: 'Client', required: true },
  drivers: [{ type: String, required: true, default: [] }]
});

Truck.plugin(uniqueValidator);
Truck.plugin(softDelete, { deletedAt: true });

export default model('Truck', Truck);
