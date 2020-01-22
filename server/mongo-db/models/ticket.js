import {Schema, model} from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const Ticket = new Schema({
  folio: {type: String, required: false},
  driver: {type: String, required: false},
  client: {type: Schema.Types.ObjectId, ref: 'Client', required: false},
  truck: {type: Schema.Types.ObjectId, ref: 'Truck', required: false},
  product: {type: Schema.Types.ObjectId, ref: 'Rock', required: false},
  tax: {type: Number, required: false},
  weight: {type: Number, required: false},
  totalWeight: {type: Number, required: false},
  totalPrice: {type: Number, required: false},
  credit: {type: Boolean, required: false},
  date: {type: Date, required: false, default: Date.now},
  inTruckImage: {type: String, required: false},
  outTruckImage: {type: String, required: false},
  bill: {type: Boolean, required: true, default: false},
  turn: {type: Schema.Types.ObjectId, ref: 'Turn', required: false},
});

Ticket.plugin(uniqueValidator);
export default model('Ticket', Ticket);
