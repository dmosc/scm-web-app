import { Types } from 'mongoose';
import moment from 'moment-timezone';
import { ClientSubscription, ClientSubscriptionWarning, Ticket } from '../../mongo-db/models';

const tasks = {
  clientSubscriptionUpdate: async () => {
    try {
      const clientSubscriptions = await ClientSubscription.find({
        deleted: false,
        isWarningActive: false
      });

      const $match = {
        totalPrice: { $exists: true },
        outTruckImage: { $exists: true },
        deleted: false
      };

      const promises = [];
      for (let i = 0; i < clientSubscriptions.length; i++) {
        const start = new Date(clientSubscriptions[i].start);
        const end = new Date(clientSubscriptions[i].end);

        $match.client = clientSubscriptions[i].client;
        $match.out = { $gte: start, $lte: end };

        // eslint-disable-next-line no-await-in-loop
        let [results] = await Ticket.aggregate([
          { $match },
          { $lookup: { from: 'users', localField: 'client', foreignField: '_id', as: 'client' } },
          {
            $group: {
              _id: '$client',
              tons: { $sum: '$totalWeight' }
            }
          },
          {
            $project: {
              _id: 0,
              subscription: Types.ObjectId(clientSubscriptions[i].id),
              tons: '$tons'
            }
          }
        ]);

        if (!results) results = { subscription: clientSubscriptions[i].id, tons: 0 };

        results.start = start;
        results.end = end;
        if (end.getTime() <= new Date().getTime()) {
          const update = {
            start: moment(end).add(1, 'day'),
            end: moment(end).add(clientSubscriptions[i].days + 1, 'day')
          };

          if (results.tons < clientSubscriptions[i].tons * (1 - clientSubscriptions[i].margin)) {
            // Warning
            update.isWarningActive = true;
            promises.push(new ClientSubscriptionWarning({ ...results }).save());
          }

          promises.push(ClientSubscription.findByIdAndUpdate(results.subscription, update));
        }
      }

      await Promise.all(promises);
    } catch (e) {
      return false;
    }

    return true;
  }
};

export default tasks;
