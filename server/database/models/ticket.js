import {Schema, model} from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const Ticket = new Schema({
  folio: {type: String, required: false},
  client: {type: Schema.ObjectId, ref: 'Client', required: false},
  truck: {type: Schema.ObjectId, ref: 'Truck', required: false},
  product: {type: Schema.ObjectId, ref: 'Rock', required: false},
  tax: {type: Number, required: false},
  weight: {type: Number, required: false},
  totalWeight: {type: Number, required: false},
  totalPrice: {type: Number, required: false},
  date: {type: Date, required: false, default: Date.now},
  inTruckImage: {type: String, required: false},
  outTruckImage: {type: String, required: false},
});

Ticket.plugin(uniqueValidator);
export default model('Ticket', Ticket);
