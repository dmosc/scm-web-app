import {Schema, model} from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const Rock = new Schema({
  name: {type: String, required: true, index: {unique: true}},
  price: {type: Number, required: true},
});

Rock.plugin(uniqueValidator);
export default model('Rock', Rock);
