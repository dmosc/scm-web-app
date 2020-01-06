import {User} from '../../../mongo-db/models';
import {ApolloError} from 'apollo-server-core';
import authenticated from '../../middleware/authenticated';

const userQueries = {
  user: async (_, args) => {
    const {id} = args;
    const user = await User.findById(id);

    if (!user) throw new ApolloError('User not found');
    else return user;
  },
  users: authenticated(async (_, {filters: {limit}}) => {
    const users = await User.find({kind: {$exists: false}}).limit(limit || 10);

    if (!users) throw new ApolloError('No users registered!');
    else return users;
  }),
};

export default userQueries;
