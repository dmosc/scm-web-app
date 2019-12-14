import {GraphQLUpload} from 'graphql-upload';

//User
import userQueries from './user/queries';
import userMutations from './user/mutations';

const resolvers = {
  Query: {
    ...userQueries,
  },
  Mutation: {
    ...userMutations,
  },
  Upload: GraphQLUpload,
};

export default resolvers;
