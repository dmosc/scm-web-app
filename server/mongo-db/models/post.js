import { Schema, model } from 'mongoose';
import softDelete from 'mongoose-delete';

const Post = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  attachments: { type: [String], default: [] },
  gallery: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

Post.plugin(softDelete, { deletedAt: true });

export default model('Post', Post);
