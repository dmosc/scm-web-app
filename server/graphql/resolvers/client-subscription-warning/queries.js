import authenticated from '../../middleware/authenticated';
import { ClientSubscriptionWarning } from '../../../mongo-db/models';

const clientSubscriptionWarningQueries = {
  clientSubscriptionWarning: authenticated(async (_, args) => {
    return ClientSubscriptionWarning.findOne({ subscription: args.id }).populate(
      'subscription resolvedBy'
    );
  }),
  clientSubscriptionWarningCount: authenticated(async () => {
    return ClientSubscriptionWarning.countDocuments({
      deleted: false,
      resolvedBy: { $exists: false }
    });
  })
};

export default clientSubscriptionWarningQueries;
