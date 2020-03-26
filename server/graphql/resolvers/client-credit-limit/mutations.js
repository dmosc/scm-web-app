import { ClientCreditLimit } from '../../../mongo-db/models';

const clientCreditMutations = {
  clientCreditLimit: async (_, { clientCreditLimit }, { req: { userRequesting } }) => {
    const { client, creditLimit, unlimited } = clientCreditLimit;

    const newCreditLimit = new ClientCreditLimit({
      client,
      creditLimit: unlimited ? Number.MAX_SAFE_INTEGER : creditLimit.toFixed(2),
      setBy: userRequesting.id
    });

    return newCreditLimit.save();
  }
};

export default clientCreditMutations;
