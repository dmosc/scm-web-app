import { model, Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import softDelete from 'mongoose-delete';

const ClientsGroup = new Schema({
  name: { type: String, required: true, index: { unique: true } },
  clients: [{ type: Schema.ObjectId, ref: 'Client', required: true, default: [] }]
});

ClientsGroup.plugin(softDelete, { deletedAt: true });
ClientsGroup.plugin(uniqueValidator);

export default model('ClientsGroup', ClientsGroup);
