import { GraphQLUpload } from 'graphql-upload';

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

// Folio
import folioMutations from './folio/mutations';

// Post
import postMutations from './post/mutations';
import postQueries from './post/queries';
import postSubscriptions from './post/subscriptions';

// Message
import messageMutations from './message/mutations';
import messageQueries from './message/queries';
import messageSubscriptions from './message/subscriptions';

// Turn
import turnMutations from './turn/mutations';
import turnQueries from './turn/queries';
import turnSubscriptions from './turn/subscriptions';

// Price request
import priceRequestMutations from './price-request/mutations';
import priceRequestQueries from './price-request/queries';

// Rock price request
import rockPriceRequestMutations from './rock-price-request/mutations';
import rockPriceRequestQueries from './rock-price-request/queries';

// AWS Stuff
import uploaders from './aws/uploaders';

const resolvers = {
  Query: {
    ...userQueries,
    ...clientQueries,
    ...ticketQueries,
    ...truckQueries,
    ...rockQueries,
    ...postQueries,
    ...messageQueries,
    ...turnQueries,
    ...priceRequestQueries,
    ...rockPriceRequestQueries
  },
  Mutation: {
    ...userMutations,
    ...clientMutations,
    ...ticketMutations,
    ...truckMutations,
    ...rockMutations,
    ...folioMutations,
    ...postMutations,
    ...messageMutations,
    ...turnMutations,
    ...priceRequestMutations,
    ...rockPriceRequestMutations,
    ...uploaders // AWS
  },
  Subscription: {
    ...ticketSubscriptions,
    ...postSubscriptions,
    ...messageSubscriptions,
    ...turnSubscriptions
  },
  Upload: GraphQLUpload
};

export default resolvers;
