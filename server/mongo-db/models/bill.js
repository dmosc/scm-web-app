import { model, Schema } from 'mongoose';
import softDelete from 'mongoose-delete';
import disable from 'mongoose-disable';

const ProductSummary = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Rock', required: false },
  price: { type: Number, required: true },
  weight: { type: Number, required: true },
  total: { type: Number, required: true }
});

const Bill = new Schema({
  date: { type: Date, required: false, default: Date.now },
  folio: { type: String, required: false },
  client: { type: Schema.ObjectId, ref: 'Client', required: true },
  store: { type: Schema.Types.ObjectId, ref: 'Store', required: false },
  folios: [{ type: String, required: true }],
  products: [{ type: ProductSummary, required: true }],
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  creditDays: {
    type: Number,
    required: true,
    validate: {
      // WATCH OUT: Validators will run on .save() operations
      validator: function validator(creditDays) {
        return creditDays >= 0;
      },
      message: 'Los días de crédito deben ser un número positivo'
    }
  },
  bill: { type: Boolean, required: true }
});

Bill.plugin(softDelete, { deletedAt: true });
Bill.plugin(disable, { disabledAt: true });

export default model('Bill', Bill);
