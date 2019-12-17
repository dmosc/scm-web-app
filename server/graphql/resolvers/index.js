import {GraphQLUpload} from 'graphql-upload';

// User
import userQueries from './user/queries';
import userMutations from './user/mutations';

// Client
import clientQueries from './client/queries';
import clientMutations from './client/mutations';

// Ticket
import ticketQueries from './ticket/queries';
import ticketMutations from './ticket/mutations';
import ticketSubscriptions from './ticket/subscriptions';

// Truck
import truckMutations from './truck/mutations';
import truckQueries from './truck/queries';

// Rock
import rockMutations from './rock/mutations';
import rockQueries from './rock/queries';

const resolvers = {
  Query: {
    ...userQueries,
    ...clientQueries,
    ...ticketQueries,
    ...truckQueries,
    ...rockQueries,
  },
  Mutation: {
    ...userMutations,
    ...clientMutations,
    ...ticketMutations,
    ...truckMutations,
    ...rockMutations,
  },
  Subscription: {
    ...ticketSubscriptions,
  },
  Upload: GraphQLUpload,
};

export default resolvers;
