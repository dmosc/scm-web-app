import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';

const Machine = new Schema({
  name: { type: String, required: true },
  plates: { type: String, required: true, unique: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  drivers: [{ type: String, required: true, default: [] }],
  averageHorometer: {
    type: Number,
    required: true,
    validate: {
      validator: function validator(hoursPerLiter) {
        return hoursPerLiter >= 0;
      },
      message: 'El horómetro no puede ser menor a 0!'
    }
  },
  standardHorometerDeviation: {
    type: Number,
    required: true,
    validate: {
      validator: function validator(standardDeviation) {
        return standardDeviation >= 0;
      },
      message: 'La desviación estándar del horómetro debe ser mayor o igual a 0!'
    }
  }
});

Machine.plugin(softDelete, { deletedAt: true });

export default model('Machine', Machine);
