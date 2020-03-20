import { ClientPrice } from '../../../mongo-db/models';

const clientPriceMutations = {
  clientPrice: async (_, { clientPrice }, { req: { userRequesting } }) => {
    const newClientPrice = new ClientPrice({
      ...clientPrice,
      setBy: userRequesting.id
    });

    newClientPrice.save();
  }
};

export default clientPriceMutations;
