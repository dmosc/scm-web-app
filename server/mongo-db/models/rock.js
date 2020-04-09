import { model, Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import softDelete from 'mongoose-delete';

const Rock = new Schema({
  name: { type: String, required: true, index: { unique: true } },
  price: {
    type: Number,
    required: true,
    validate: {
      // WATCH OUT: Validators will run on .save() operations
      validator: function validator(price) {
        return price >= this.floorPrice;
      },
      message: "Price can't be less than floor price"
    }
  },
  floorPrice: {
    type: Number,
    required: true,
    validate: {
      // WATCH OUT: Validators will run on .save() operations
      validator: function validator(floorPrice) {
        return floorPrice <= this.price;
      },
      message: "Floor price can't be less than price"
    }
  },
  color: { type: String, required: true, index: { unique: true } }
});

Rock.plugin(softDelete, { deletedAt: true });
Rock.plugin(uniqueValidator);

export default model('Rock', Rock);
