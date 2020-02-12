import { Schema, model } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import softDelete from 'mongoose-delete';

const Rock = new Schema({
  name: { type: String, required: true, index: { unique: true } },
  price: { type: Number, required: true },
  color: { type: String, required: true, index: { unique: true } }
});

Rock.plugin(softDelete, { deletedAt: true });
Rock.plugin(uniqueValidator);

export default model('Rock', Rock);
