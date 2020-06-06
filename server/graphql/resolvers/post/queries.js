import { Post } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const postQueries = {
  posts: authenticated(
    async (
      _,
      {
        filters: {
          createdAt = {},
          updatedAt = {},
          page = 1,
          pageSize = Number.MAX_SAFE_INTEGER,
          author,
          createdOrder = 'desc'
        }
      }
    ) => {
      const query = {};

      if (createdAt)
        query.createdAt = {
          $gte: new Date(createdAt.start || '1970-01-01T00:00:00.000Z'),
          $lte: new Date(createdAt.end || '2100-12-31T00:00:00.000Z')
        };

      if (updatedAt)
        query.createdAt = {
          $gte: new Date(createdAt.start || '1970-01-01T00:00:00.000Z'),
          $lte: new Date(createdAt.end || '2100-12-31T00:00:00.000Z')
        };

      if (author) query.author = author;

      const posts = await Post.find(query)
        .skip(pageSize * (page - 1))
        .limit(pageSize)
        .sort({ createdAt: createdOrder })
        .populate('author');

      if (!posts) throw new Error('¡Ha habido un error cargando los posts!');

      return posts;
    }
  )
};

export default postQueries;
