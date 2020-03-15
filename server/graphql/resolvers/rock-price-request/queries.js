import { RockPriceRequest } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const rockPriceRequests = {
  rockPriceRequest: authenticated((_, { id }) => RockPriceRequest.findOne({ _id: id })),
  rockPriceRequests: authenticated(async (_, { filters }) => {
    const query = { ...filters };

    if (query.creationStart && query.creationEnd) {
      query.createdAt = {
        $gte: query.creationStart ? query.creationStart : new Date('1970-01-01'),
        $lte: query.creationEnd ? query.creationEnd : new Date('2100-12-31')
      };
    }

    if (query.reviewedStart && query.reviewedEnd) {
      query.reviewedAt = {
        $gte: query.reviewedStart ? query.reviewedStart : new Date('1970-01-01'),
        $lte: query.reviewedEnd ? query.reviewedEnd : new Date('2100-12-31')
      };
    }

    delete query.creationStart;
    delete query.creationEnd;
    delete query.reviewedStart;
    delete query.reviewedEnd;

    return RockPriceRequest.find(query)
      .populate('requester')
      .populate('rock')
      .populate('reviewedBy');
  })
};

export default rockPriceRequests;
