import { PriceRequest } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const priceRequests = {
  priceRequest: authenticated((_, { id }) => PriceRequest.findOne({ _id: id })),
  priceRequests: authenticated(async (_, { filters }) => PriceRequest.find(filters))
};

export default priceRequests;
