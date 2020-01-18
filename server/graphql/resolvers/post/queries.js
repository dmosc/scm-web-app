import {Post} from '../../../sequelize-db/models';
import authenticated from '../../middleware/authenticated';

const postQueries = {
  post: authenticated(async (_, args) => {
    const {id} = args;
    const post = await Post.findByPk(id);

    if (!post) throw new Error('¡No se ha podido encontrar el post!');

    return post;
  }),
  posts: authenticated(async (_, {filters: {limit}}) => {
    const posts = await Post.findAll({
      attributes: ['id', 'username', 'title', 'content', 'createdAt'],
      limit: limit ? limit : 50,
      order: [['createdAt', 'DESC']],
    });

    if (!posts) throw new Error('¡Ha habido un error cargando los posts!');

    return posts;
  }),
};

export default postQueries;
