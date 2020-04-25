import { GraphQLUpload } from 'graphql-upload';
// User
import userQueries from './user/queries';
import userMutations from './user/mutations';
// Client
import clientQueries from './client/queries';
import clientMutations from './client/mutations';
// Client price
import clientPriceQueries from './client-price/queries';
import clientPriceMutations from './client-price/mutations';
// Client credit limit
import clientCreditLimitQueries from './client-credit-limit/queries';
import clientCreditLimitMutations from './client-credit-limit/mutations';
// Ticket
import ticketQueries from './ticket/queries';
import ticketMutations from './ticket/mutations';
import ticketSubscriptions from './ticket/subscriptions';
// Truck
import truckMutations from './truck/mutations';
import truckQueries from './truck/queries';
// Bill
import billMutations from './bill/mutations';
import billQueries from './bill/queries';
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
// Store
import storeMutations from './store/mutations';
import storeQueries from './store/queries';
// Machine
import machineMutations from './machine/mutations';
import machineQueries from './machine/queries';
// Machine Diesel Load
import machineDieselLoadMutations from './machine-diesel-load/mutations';
import machineDieselLoadQueries from './machine-diesel-load/queries';
// Tank Diesel Load
import tankDieselLoadMutations from './tank-diesel-load/mutations';
import tankDieselLoadQueries from './tank-diesel-load/queries';
// Quotation
import quotationMutations from './quotation/mutations';
import quotationQueries from './quotation/queries';
// AWS Stuff
import uploaders from './aws/uploaders';

const resolvers = {
  Query: {
    ...userQueries,
    ...clientQueries,
    ...clientPriceQueries,
    ...clientCreditLimitQueries,
    ...ticketQueries,
    ...truckQueries,
    ...billQueries,
    ...rockQueries,
    ...postQueries,
    ...messageQueries,
    ...turnQueries,
    ...priceRequestQueries,
    ...rockPriceRequestQueries,
    ...storeQueries,
    ...machineQueries,
    ...machineDieselLoadQueries,
    ...tankDieselLoadQueries,
    ...quotationQueries
  },
  Mutation: {
    ...userMutations,
    ...clientMutations,
    ...clientPriceMutations,
    ...clientCreditLimitMutations,
    ...ticketMutations,
    ...truckMutations,
    ...billMutations,
    ...rockMutations,
    ...folioMutations,
    ...postMutations,
    ...messageMutations,
    ...turnMutations,
    ...priceRequestMutations,
    ...rockPriceRequestMutations,
    ...storeMutations,
    ...machineMutations,
    ...machineDieselLoadMutations,
    ...tankDieselLoadMutations,
    ...quotationMutations,
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
