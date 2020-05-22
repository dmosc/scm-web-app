import moment from 'moment';
import authenticated from '../../middleware/authenticated';
import { Client, ClientSubscription, ClientSubscriptionWarning } from '../../../mongo-db/models';

const clientSubscriptionMutations = {
  clientSubscription: authenticated(async (_, args, { req: { userRequesting } }) => {
    const isClientSubscriptionActive = await Client.findOne({
      _id: args.clientSubscription.client,
      hasSubscription: true
    });

    if (isClientSubscriptionActive) throw new Error('Ya existe una subscripcion activa!');

    const clientSubscription = new ClientSubscription({ ...args.clientSubscription });

    if (args.clientSubscription.start)
      clientSubscription.start = moment(args.clientSubscription.start).set({
        hours: 0,
        minutes: 0,
        seconds: 0
      });
    else clientSubscription.start = moment()?.set({ hours: 0, minutes: 0, seconds: 0 });

    clientSubscription.end = moment(clientSubscription.start)
      .add(clientSubscription.days, 'days')
      .set({
        hours: 23,
        minutes: 59,
        seconds: 59
      });
    clientSubscription.requestedBy = userRequesting.id;

    try {
      await clientSubscription.save();
      await Client.findByIdAndUpdate(clientSubscription.client, { hasSubscription: true });
      return ClientSubscription.findById(clientSubscription.id).populate('client requestedBy');
    } catch (e) {
      return e;
    }
  }),
  clientSubscriptionEdit: authenticated(async (_, args) => {
    const clientSubscription = await ClientSubscription.findByIdAndUpdate(
      args.clientSubscription.id,
      { ...args.clientSubscription }
    );

    if (args.clientSubscription.start)
      clientSubscription.start = moment(args.clientSubscription.start).set({
        hours: 0,
        minutes: 0,
        seconds: 0
      });
    else clientSubscription.start = moment()?.set({ hours: 0, minutes: 0, seconds: 0 });

    clientSubscription.end = moment(clientSubscription.start)
      .add(clientSubscription.days, 'days')
      .set({
        hours: 23,
        minutes: 59,
        seconds: 59
      });

    try {
      await clientSubscription.save();
      return ClientSubscription.findById(clientSubscription.id).populate('client requestedBy');
    } catch (e) {
      return e;
    }
  }),
  clientSubscriptionDelete: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    const clientSubscription = await ClientSubscription.findByIdAndUpdate(id, {
      isWarningActive: false
    });
    const clientSubscriptionWarning = await ClientSubscriptionWarning.findOne({
      subscription: id,
      deleted: false
    });

    try {
      await Client.findByIdAndUpdate(clientSubscription.client, { $unset: { hasSubscription: 1 } });
      await ClientSubscription.deleteById(id, userRequesting.id);
      await ClientSubscriptionWarning.deleteById(clientSubscriptionWarning.id, userRequesting.id);
      return true;
    } catch (e) {
      return e;
    }
  })
};

export default clientSubscriptionMutations;
