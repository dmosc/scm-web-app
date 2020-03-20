import { Schema } from 'mongoose';
import roles from '../enums/roles';
import { User } from './index';
import CFDIuse from '../enums/CFDIuse';

const Client = User.discriminator(
  'Client',
  new Schema({
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    username: { type: String, required: false },
    password: { type: String, required: false },
    uniqueId: {
      type: Number,
      required: true,
      unique: true,
      validate: {
        validator: function validator(id) {
          return id >= 1000000;
        },
        message: 'Ids de clientes tienen que ser mayores a 1000000'
      }
    },
    role: { type: String, enum: [...roles], required: true, default: 'CLIENT' },
    trucks: [{ type: Schema.ObjectId, ref: 'Truck', required: true, default: [] }],
    businessName: { type: String, required: true },
    rfc: { type: String, required: true, default: 'XAXX010101000' },
    CFDIuse: { type: String, enum: [...CFDIuse], default: 'NE' },
    cellphone: [{ type: String, required: true, default: [] }],
    address: {
      country: { type: String, required: true, default: '' },
      state: { type: String, required: true, default: '' },
      municipality: { type: String, required: true, default: '' },
      city: { type: String, required: true, default: '' },
      suburb: { type: String, required: true, default: '' },
      street: { type: String, required: true, default: '' },
      extNumber: { type: String, required: false, default: '' },
      intNumber: { type: String, required: true, default: '' },
      zipcode: { type: String, required: true, default: '' }
    },
    balance: { type: Number, required: true, default: 0 },
    credit: { type: Number, required: true, default: 0 }
  })
);

export default Client;
