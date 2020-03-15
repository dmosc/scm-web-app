import { Schema, model } from 'mongoose';
import softDelete from 'mongoose-delete';

const RockPriceRequest = new Schema({
  requester: { type: Schema.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  rock: { type: Schema.ObjectId, ref: 'Rock', required: true },
  priceRequested: {
    type: Number,
    required: true,
    validate: {
      // WATCH OUT: Validators will run on .save() operations
      validator: function validator(price) {
        return price > 0;
      },
      message: 'Price requested must be greater than 0'
    }
  },
  reviewedBy: { type: Schema.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  status: {
    type: String,
    enum: ['PENDING', 'REJECTED', 'ACCEPTED'],
    required: true,
    default: 'PENDING'
  }
});

RockPriceRequest.plugin(softDelete, { deletedAt: true });

export default model('RockPriceRequest', RockPriceRequest);
