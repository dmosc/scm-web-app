import authenticated from '../../middleware/authenticated';
import { ClientSubscription, ClientSubscriptionWarning } from '../../../mongo-db/models';

const clientSubscriptionWarningMutations = {
  clientSubscriptionWarningResolve: authenticated(async (_, args, { req: { userRequesting } }) => {
    const clientSubscriptionWarning = await ClientSubscriptionWarning.findByIdAndUpdate(
      args.clientSubscriptionWarning.id,
      { ...args.clientSubscriptionWarning, resolvedBy: userRequesting.id },
      { new: true }
    ).populate('subscription resolvedBy');

    await ClientSubscription.findByIdAndUpdate(clientSubscriptionWarning.subscription, {
      isWarningActive: false
    });
    return clientSubscriptionWarning;
  })
};

export default clientSubscriptionWarningMutations;
