import { Schema, model } from 'mongoose';
import softDelete from 'mongoose-delete';

const ClientCreditLimit = new Schema({
  client: { type: Schema.ObjectId, ref: 'Client', required: true },
  creditLimit: { type: Number, required: true, default: 0 },
  addedAt: { type: Date, required: true, default: Date.now },
  setBy: { type: Schema.ObjectId, ref: 'User', required: true }
});

ClientCreditLimit.plugin(softDelete, { deletedAt: true });

export default model('ClientCreditLimit', ClientCreditLimit);
