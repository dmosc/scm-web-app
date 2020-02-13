import { ApolloError } from 'apollo-server-core';
import { User } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const userQueries = {
  user: async (_, args) => {
    const { id } = args;
    const user = await User.findById(id);

    if (!user) throw new ApolloError('¡No ha sido posible encontrar el usuario!');
    else return user;
  },
  users: authenticated(async (_, { filters: { limit, search } }) => {
    const users = await User.find({
      kind: {
        $exists: false
      },
      $or: [
        { username: { $in: [new RegExp(search, 'i')] } },
        { firstName: { $in: [new RegExp(search, 'i')] } },
        { lastName: { $in: [new RegExp(search, 'i')] } },
        { email: { $in: [new RegExp(search, 'i')] } },
        { role: { $in: [new RegExp(search, 'i')] } }
      ]
    }).limit(limit || 10);

    if (!users) throw new ApolloError('¡Ha habido un error cargando los usuarios!');
    else return users;
  })
};

export default userQueries;
