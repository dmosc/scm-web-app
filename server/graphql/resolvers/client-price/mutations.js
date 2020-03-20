import { ClientPrice } from '../../../mongo-db/models';

const clientPriceMutations = {
  clientPrices: async (_, { clientPrices }, { req: { userRequesting } }) => {
    const pricesToSave = clientPrices.map(clientPrice => {
      const newClientPrice = new ClientPrice({
        ...clientPrice,
        setBy: userRequesting.id
      });

      return newClientPrice.save();
    });

    return Promise.all(pricesToSave);
  }
};

export default clientPriceMutations;
