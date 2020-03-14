import { Schema } from 'mongoose';
import roles from '../enums/roles';
import { User } from './index';
import CFDIuse from '../enums/CFDIuse';

const Price = new Schema({
  rock: { type: Schema.Types.ObjectId, ref: 'Rock', required: true },
  price: { type: Number, required: true }
});

const Client = User.discriminator(
  'Client',
  new Schema({
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    username: { type: String, required: false },
    password: { type: String, required: false, default: '' },
    role: { type: String, enum: [...roles], required: true, default: 'CLIENT' },
    trucks: [{ type: Schema.ObjectId, ref: 'Truck', required: true, default: [] }],
    businessName: { type: String, required: true },
    rfc: { type: String, required: true },
    CFDIuse: { type: String, enum: [...CFDIuse] },
    cellphone: [{ type: String, required: true, default: [] }],
    address: { type: String, required: true },
    zipcode: { type: String, required: true },
    prices: [{ type: Price, required: true, default: [] }],
    credit: { type: Number, required: true, default: 0 }
  })
);

export default Client;
