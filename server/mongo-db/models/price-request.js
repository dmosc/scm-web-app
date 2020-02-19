import { Schema, model } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import softDelete from 'mongoose-delete';

const Price = new Schema({
  rock: { type: Schema.ObjectId, ref: 'Rock' },
  priceRequested: {
    type: Number,
    required: true,
    validate: {
      // WATCH OUT: Valiadtors will run on .save() operations
      validator: function validator(price) {
        return price > 0;
      },
      message: 'Price requested must be greater than 0'
    }
  }
});

const PriceRequest = new Schema({
  requester: { type: Schema.ObjectId, ref: 'User', required: true },
  client: { type: Schema.ObjectId, ref: 'Client', required: true },
  createdAt: { type: Date, default: Date.now },
  prices: {
    type: [Price],
    validate: {
      // WATCH OUT: Valiadtors will run on .save() operations
      validator: function validator(prices) {
        return prices.length > 0;
      },
      message: 'Minimum prices requested must be 1'
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

PriceRequest.plugin(softDelete, { deletedAt: true });
PriceRequest.plugin(uniqueValidator);

export default model('PriceRequest', PriceRequest);
