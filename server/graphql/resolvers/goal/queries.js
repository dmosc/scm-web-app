import { Types } from 'mongoose';
import authenticated from '../../middleware/authenticated';
import { Goal, Ticket } from '../../../mongo-db/models';

const goalQueries = {
  goal: authenticated(async (_, args) => {
    const { id } = args;
    const goal = await Goal.findOne({ _id: id, deleted: false }).populate('rocks');

    if (!goal) throw new Error('¡La meta no existe!');

    return goal;
  }),
  goals: authenticated(async () => {
    const goals = await Goal.find({ deleted: false }).populate('rocks');

    if (!goals) throw new Error('¡No ha sido posible cargar las metas!');

    return goals;
  }),
  goalSummary: authenticated(async (_, { id }) => {
    const goal = await Goal.findById(id).populate('rocks');
    const start = new Date(goal.start);
    const end = new Date(goal.end);

    if (!goal) throw new Error('¡No ha sido posible cargar la meta!');

    const $match = {
      turn: { $exists: true },
      totalPrice: { $exists: true },
      outTruckImage: { $exists: true },
      out: { $gte: start, $lte: end },
      product: { $in: [...goal.rocks.map(rock => Types.ObjectId(rock.id))] }
    };

    const goalSummary = await Ticket.aggregate([
      {
        $match
      },
      { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
      {
        $group: {
          _id: null,
          total: { $sum: { $subtract: ['$totalPrice', '$tax'] } },
          tons: { $sum: '$totalWeight' }
        }
      },
      {
        $project: {
          _id: 0,
          tons: '$tons',
          total: '$total'
        }
      }
    ]);

    if (goalSummary.length === 1) return { goal, ...goalSummary[0] };

    return { goal, tons: 0, total: 0 };
  }),
  goalsSummary: authenticated(async () => {
    const goals = await Goal.find({ deleted: false }).populate('rocks');

    if (!goals) throw new Error('¡No ha sido posible cargar las metas!');

    const goalsSummary = [];
    for (let i = 0; i < goals.length; i++) {
      const goal = goals[i];
      const start = new Date(goal.start);
      const end = new Date(goal.end);

      const $match = {
        turn: { $exists: true },
        totalPrice: { $exists: true },
        outTruckImage: { $exists: true },
        out: { $gte: start, $lte: end },
        product: { $in: [...goal.rocks.map(rock => Types.ObjectId(rock.id))] }
      };

      // eslint-disable-next-line no-await-in-loop
      const goalSummary = await Ticket.aggregate([
        {
          $match
        },
        { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
        {
          $group: {
            _id: null,
            total: { $sum: { $subtract: ['$totalPrice', '$tax'] } },
            tons: { $sum: '$totalWeight' }
          }
        },
        {
          $project: {
            _id: 0,
            tons: '$tons',
            total: '$total'
          }
        }
      ]);

      if (goalSummary.length === 1) {
        goalsSummary.push({ goal, ...goalSummary[0] });
      } else {
        goalsSummary.push({ goal, tons: 0, total: 0 });
      }
    }

    return goalsSummary;
  })
};

export default goalQueries;
