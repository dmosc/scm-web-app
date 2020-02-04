import { Post } from '../../../sequelize-db/models';
import authenticated from '../../middleware/authenticated';

const postMutations = {
  post: authenticated(async (_, args, { pubsub }) => {
    const post = Post.create({ ...args.post });

    if (!post) throw new Error('¡Hubo un error intentando crear el mensaje!');

    pubsub.publish('NEW_POST', {
      newPost: post
    });

    return post;
  })
};

export default postMutations;
