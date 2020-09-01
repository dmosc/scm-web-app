import authenticated from '../../middleware/authenticated';
import { ClientSubscription } from '../../../mongo-db/models';

const clientSubscriptionQueries = {
  clientSubscriptions: authenticated(async (_, { filters: { limit, status } }) => {
    const query = { deleted: false };

    if (status !== 'ALL') query.isWarningActive = status === 'WITH_WARNING';

    const clientSubscriptions = await ClientSubscription.find(query)
      .limit(limit || Number.MAX_SAFE_INTEGER)
      .populate('client requestedBy');

    if (!clientSubscriptions) throw new Error('¡No ha sido posible cargar las suscripciones!');

    return clientSubscriptions;
  })
};

export default clientSubscriptionQueries;
