import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';
import disable from 'mongoose-disable';

const Ticket = new Schema({
  folio: { type: String, required: false },
  driver: { type: String, required: false },
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: false },
  truck: { type: Schema.Types.ObjectId, ref: 'Truck', required: false },
  product: { type: Schema.Types.ObjectId, ref: 'Rock', required: false },
  store: { type: Schema.Types.ObjectId, ref: 'Store', required: false },
  promotion: { type: Schema.Types.ObjectId, ref: 'Promotion', required: false },
  tax: { type: Number, required: false },
  weight: { type: Number, required: false },
  totalWeight: { type: Number, required: false },
  totalPrice: { type: Number, required: false },
  credit: { type: Boolean, required: false },
  in: { type: Date, required: false, default: Date.now },
  load: { type: Date, required: false },
  out: { type: Date, required: false },
  inTruckImage: { type: String, required: false },
  outTruckImage: { type: String, required: false },
  bill: { type: Boolean, required: true, default: false },
  isBilled: { type: Boolean, required: true, default: false },
  usersInvolved: {
    guard: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    loader: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    cashier: { type: Schema.Types.ObjectId, ref: 'User', required: false }
  },
  turn: { type: Schema.Types.ObjectId, ref: 'Turn', required: false }
});

Ticket.plugin(softDelete, { deletedAt: true });
Ticket.plugin(disable, { disabledAt: true });

export default model('Ticket', Ticket);
