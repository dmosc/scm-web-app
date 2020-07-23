import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';
import supplyTypes from '../../utils/enums/supplyTypes';
import units from '../../utils/enums/units';

const Supply = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: [...supplyTypes], required: true },
  unit: { type: String, enum: [...units], required: true },
  quantity: { type: Number, required: true, min: 0 }
});

Supply.plugin(softDelete, { deletedAt: true });

export default model('Supply', Supply);
