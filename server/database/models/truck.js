import {Schema, model} from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const Truck = new Schema({
  plate: {type: String, required: true, index: {unique: true}},
  brand: {type: String, required: true},
  model: {type: String, required: true},
  client: {type: Schema.Types.ObjectId, ref: 'Client', required: true},
  weight: {type: Number, required: true},
  drivers: [{type: String, required: true, default: []}],
});

Truck.plugin(uniqueValidator);
export default model('Truck', Truck);
