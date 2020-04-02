import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';
import periods from '../../utils/enums/periods';

const Turn = new Schema({
  user: { type: Schema.ObjectId, ref: 'User', required: true },
  start: { type: Date, required: true },
  end: { type: Date },
  period: { type: String, enum: [...periods], required: true },
  folios: [{ type: String, required: true, default: [] }],
  uniqueId: {
    type: Number,
    unique: true,
    validate: {
      validator: function validator(id) {
        return id >= 1000000;
      },
      message: 'Ids de clientes tienen que ser mayores a 1000000'
    }
  }
});

Turn.plugin(softDelete, { deletedAt: true });
Turn.pre('save', async function addUniqueId(next) {
  if (this.isNew) {
    const [{ uniqueId }] = await model('Turn', Turn)
      .find()
      .sort({ uniqueId: -1 })
      .limit(1);

    // eslint-disable-next-line no-param-reassign
    this.uniqueId = uniqueId + 1;
  }

  next();
});

export default model('Turn', Turn);
