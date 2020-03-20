import { ClientPrice } from '../../../mongo-db/models';

const clientPriceMutations = {
  clientPrice: async (_, { clientPrice }, { req: { userRequesting } }) => {
    const newClientPrice = new ClientPrice({
      ...clientPrice,
      setBy: userRequesting.id
    });

    return newClientPrice.save();
  }
};

export default clientPriceMutations;
