import { PriceRequest } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const priceRequests = {
  priceRequest: authenticated((_, { id }) => PriceRequest.findOne({ _id: id })),
  priceRequests: authenticated(async (_, { filters }) => {
    const query = { ...filters };

    query.createdAt = {
      $gte: query.creationStart ? query.creationStart : new Date('1970-01-01'),
      $lte: query.creationEnd ? query.creationEnd : new Date('2100-12-31')
    };

    query.reviewedAt = {
      $gte: query.reviewedStart ? query.reviewedStart : new Date('1970-01-01'),
      $lte: query.reviewedEnd ? query.reviewedEnd : new Date('2100-12-31')
    };

    delete query.creationStart;
    delete query.creationEnd;
    delete query.reviewedStart;
    delete query.reviewedEnd;

    return PriceRequest.find(query);
  })
};

export default priceRequests;
