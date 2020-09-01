import { Types } from 'mongoose';
import Twilio from 'twilio';
import moment from 'moment-timezone';
import { ClientSubscription, ClientSubscriptionWarning, Goal, Ticket } from '../../mongo-db/models';
import { ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } from '../../config';
import rockQueries from '../../graphql/resolvers/rock/queries';
import ticketQueries from '../../graphql/resolvers/ticket/queries';
import phones from '../enums/phones';

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
  },
  goalsUpdate: async () => {
    try {
      const goals = await Goal.find({ deleted: false });

      const promises = [];
      for (let i = 0; i < goals.length; i++) {
        const goal = goals[i];
        const end = new Date(goal.end);

        if (end.getTime() <= new Date().getTime()) {
          const update = {
            start: moment().startOf(goal.period),
            end: moment().endOf(goal.period)
          };

          promises.push(Goal.findByIdAndUpdate(goal.id, update));
        }
      }

      await Promise.all(promises);
    } catch (e) {
      return false;
    }

    return true;
  }
};

const dailyTasks = {
  messageUpdate: async () => {
    const client = new Twilio(ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const range = {
      start: moment()
        .startOf('day')
        .subtract(1, 'day'),
      end: moment()
        .endOf('day')
        .subtract(1, 'day')
    };
    const dirty = [
      '5e22071b1c9d440000de6933',
      '5e742b26cf78df7ac5da4129',
      '5e0042963bf0ef408d2b330c'
    ];

    try {
      const cleanAndDirty = await rockQueries.rockSalesReportCleanAndDirty(undefined, {
        filters: { range },
        dirty
      });
      const ticketsSummary = await ticketQueries.ticketsSummary(undefined, { range });
      const body = `LIMPIAS: \n${cleanAndDirty.clean.totalWeight} tons - ${
        cleanAndDirty.clean.total
      }MXN \n\nSUCIAS: \n${cleanAndDirty.dirty.totalWeight} tons - ${
        cleanAndDirty.dirty.total
      }MXN \n\nVENTAS DE AYER: \n${ticketsSummary.upfrontWeight +
        ticketsSummary.creditWeight} tons \nCONTADO: ${ticketsSummary.upfront}MXN \nCREDITO: ${
        ticketsSummary.credit
      }MXN`;

      const messages = phones.map(phone =>
        client.messages.create({ from: TWILIO_PHONE_NUMBER, to: phone, body })
      );

      await Promise.all(messages);
    } catch (e) {
      return false;
    }

    return true;
  }
};

export { tasks, dailyTasks };
