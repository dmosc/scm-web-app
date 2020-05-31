import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';
import periodTypes from '../../utils/enums/periodTypes';

const Goal = new Schema({
  name: { type: String, required: true },
  rocks: [{ type: Schema.ObjectId, ref: 'Rock', required: true }],
  period: { type: String, enum: [...periodTypes], required: true },
  tons: { type: Number, min: 0, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true }
});

Goal.plugin(softDelete, { deletedAt: true });

export default model('Goal', Goal);
