import {Schema} from 'mongoose';
import roles from '../enums/roles';
import {User} from './index';
import CFDIuse from '../enums/CFDIuse';

const Client = User.discriminator(
  'Client',
  new Schema({
    firstName: {type: String, required: false},
    lastName: {type: String, required: false},
    role: {type: String, enum: [...roles], required: true, default: 'CLIENT'},
    trucks: [
      {type: Schema.Types.ObjectId, ref: 'Truck', required: true, default: []},
    ],
    businessName: {type: String, required: true},
    rfc: {type: String, required: true},
    CFDIuse: {type: String, enum: [...CFDIuse]},
    cellphone: [{type: Number, required: true, default: []}],
    address: {type: String, required: true},
    prices: {type: Object, required: true, default: {}},
    credit: {type: Number, required: true, default: 0},
    bill: {type: Boolean, required: true, default: false},
  })
);

export default Client;
