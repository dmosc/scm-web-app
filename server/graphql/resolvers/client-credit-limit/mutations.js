import { ClientPrice } from '../../../mongo-db/models';

const clientCreditMutations = {
  clientCreditLimit: async (_, { clientCreditLimit }, { req: { userRequesting } }) => {
    const newClientPrice = new ClientPrice({
      ...clientCreditLimit,
      setBy: userRequesting.id
    });

    return newClientPrice.save();
  }
};

export default clientCreditMutations;
