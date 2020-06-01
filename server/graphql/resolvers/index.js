import { GraphQLUpload } from 'apollo-upload-server';
// User
import userQueries from './user/queries';
import userMutations from './user/mutations';
// Client
import clientQueries from './client/queries';
import clientMutations from './client/mutations';
// Client price
import clientPriceQueries from './client-price/queries';
import clientPriceMutations from './client-price/mutations';
// Clients group
import clientsGroupQueries from './clients-group/queries';
import clientsGroupMutations from './clients-group/mutations';
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
// Promotion
import promotionMutations from './promotion/mutations';
import promotionQueries from './promotion/queries';
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
// ProductRate
import productRateMutations from './product-rate/mutations';
import productRateQueries from './product-rate/queries';
// ClientSubscription
import clientSubscriptionMutations from './client-subscription/mutations';
import clientSubscriptionQueries from './client-subscription/queries';
// ClientSubscriptionWarning
import clientSubscriptionWarningMutations from './client-subscription-warning/mutations';
import clientSubscriptionWarningQueries from './client-subscription-warning/queries';
// Goal
import goalMutations from './goal/mutations';
import goalQueries from './goal/queries';
// Blast Product
import blastProductMutations from './blast-product/mutations';
import blastProductQueries from './blast-product/queries';
// Blast
import blastMutations from './blast/mutations';
import blastQueries from './blast/queries';
// AWS Stuff
import uploaders from './aws/uploaders';

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    ...userQueries,
    ...clientQueries,
    ...clientPriceQueries,
    ...clientsGroupQueries,
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
    ...promotionQueries,
    ...storeQueries,
    ...machineQueries,
    ...machineDieselLoadQueries,
    ...tankDieselLoadQueries,
    ...quotationQueries,
    ...productRateQueries,
    ...clientSubscriptionQueries,
    ...clientSubscriptionWarningQueries,
    ...goalQueries,
    ...blastProductQueries,
    ...blastQueries
  },
  Mutation: {
    ...userMutations,
    ...clientMutations,
    ...clientPriceMutations,
    ...clientsGroupMutations,
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
    ...promotionMutations,
    ...storeMutations,
    ...machineMutations,
    ...machineDieselLoadMutations,
    ...tankDieselLoadMutations,
    ...quotationMutations,
    ...productRateMutations,
    ...clientSubscriptionMutations,
    ...clientSubscriptionWarningMutations,
    ...goalMutations,
    ...blastProductMutations,
    ...blastMutations,
    ...uploaders // AWS
  },
  Subscription: {
    ...ticketSubscriptions,
    ...postSubscriptions,
    ...messageSubscriptions,
    ...turnSubscriptions
  }
};

export default resolvers;
