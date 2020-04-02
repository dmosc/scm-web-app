import { Schema, model } from 'mongoose';
import softDelete from 'mongoose-delete';
import disable from 'mongoose-disable';

const Store = new Schema({
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  address: { type: String, required: false },
  name: { type: String, required: true },
  state: { type: String, required: false },
  municipality: { type: String, required: false }
});

Store.plugin(softDelete, { deletedAt: true });
Store.plugin(disable, { disabledAt: true });

export default model('Store', Store);
