import {Schema, model} from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const Ticket = new Schema({
  folio: {type: String, required: true},
  client: {type: Schema.Types.ObjectId, ref: 'Client', required: true},
  truck: {type: Schema.Types.ObjectId, ref: 'Truck', required: true},
  product: {type: Schema.Types.ObjectId, ref: 'Rock', required: true},
  tax: {type: Number, required: true},
  weight: {type: Number, required: true},
  totalWeight: {type: Number, required: true},
  totalPrice: {type: Number, required: true},
  date: {type: Date, required: true, default: Date.now},
  inTruckImage: {type: String, required: false},
  outTruckImage: {type: String, required: false},
});

Ticket.plugin(uniqueValidator);
export default model('Ticket', Ticket);
