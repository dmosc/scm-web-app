import { Schema } from 'mongoose';
import { User } from './index';
import roles from '../../utils/enums/roles';
import CFDIuse from '../../utils/enums/CFDIuse';

const Deposit = new Schema({
  depositedAt: { type: Date, required: true, default: Date.now },
  amount: { type: Number, required: true },
  depositedBy: { type: Schema.ObjectId, ref: 'User', required: true },
  newBalance: { type: Number, required: true }
});

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
      index: true,
      validate: {
        validator: function validator(id) {
          return id >= 1000000;
        },
        message: 'Ids de clientes tienen que ser mayores a 1000000'
      }
    },
    role: { type: String, enum: [...roles], required: true, default: 'CLIENT' },
    trucks: [{ type: Schema.ObjectId, ref: 'Truck', required: true, default: [] }],
    stores: [{ type: Schema.ObjectId, ref: 'Store', required: false }],
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
    depositHistory: { type: [Deposit], default: [] },
    defaultCreditDays: { type: Number, required: true, default: 0 },
    hasSubscription: { type: Boolean, required: true, default: false },
    createdAt: { type: Date, required: true, default: Date.now }
  })
);

export default Client;
