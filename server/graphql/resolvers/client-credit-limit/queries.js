import { ClientCreditLimit } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const clientCreditLimitQueries = {
  clientCreditLimit: authenticated(async (_, { client }) => {
    const clientCredits = await ClientCreditLimit.find({ client }).sort({ addedAt: 'descending' });

    if (!clientCredits[0]) return null;
    return clientCredits[0];
  }),
  clientCreditLimitHistory: authenticated(async (_, { client }) =>
    ClientCreditLimit.find({ client })
      .populate('setBy')
      .sort({ addedAt: 'descending' })
  )
};

export default clientCreditLimitQueries;
