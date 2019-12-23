import {Schema, model} from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import roles from '../enums/roles';

const User = new Schema(
  {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    username: {type: String, required: true, index: {unique: true}},
    email: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true, default: ''},
    role: {type: String, enum: [...roles], required: true},
    profileImage: {type: String, required: false},
    active: {type: Boolean, required: true, default: true},
  },
  {discriminatorKey: 'kind'}
);

User.plugin(uniqueValidator);
export default model('User', User);
