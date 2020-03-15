import { RockPriceRequest } from '../../../mongo-db/models';

const rockPriceRequestMutations = {
  rockPriceRequest: async (_, args, { req: { userRequesting } }) => {
    const priceRequest = new RockPriceRequest({
      ...args.priceRequest,
      requester: userRequesting.id
    });

    await priceRequest.save();

    return RockPriceRequest.findOne({ _id: priceRequest.id });
  },
  rockPriceRequestEdit: async () => {
    /* TO DO */
  }
};

export default rockPriceRequestMutations;
