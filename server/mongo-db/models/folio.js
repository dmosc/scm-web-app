import { Schema, model } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import softDelete from 'mongoose-delete';

const Folio = new Schema({
  name: { type: String, required: true, index: { unique: true } },
  count: { type: Number, required: true }
});

Folio.plugin(softDelete, { deletedBy: true });
Folio.plugin(uniqueValidator);

export default model('Folio', Folio);
