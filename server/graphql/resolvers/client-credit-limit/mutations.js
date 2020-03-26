import { ClientCreditLimit } from '../../../mongo-db/models';

const clientCreditMutations = {
  clientCreditLimit: async (_, { clientCreditLimit }, { req: { userRequesting } }) => {
    const newCreditLimit = new ClientCreditLimit({
      ...clientCreditLimit,
      setBy: userRequesting.id
    });

    return newCreditLimit.save();
  }
};

export default clientCreditMutations;
