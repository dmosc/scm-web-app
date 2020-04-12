import { ApolloError } from 'apollo-server';
import { Types } from 'mongoose';
import { Rock, Ticket } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';
import months from '../../../utils/enums/months';

const rockQueries = {
  rock: authenticated(async (_, args) => {
    const { id } = args;
    const rock = await Rock.findById(id).populate('client truck product');

    if (!rock) throw new Error('¡No existe este producto!');

    return rock;
  }),
  rocks: authenticated(async (_, { filters: { limit, search } }) => {
    const rocks = await Rock.find({
      deleted: false,
      name: { $in: [new RegExp(search, 'i')] }
    }).limit(limit || Number.MAX_SAFE_INTEGER);

    if (!rocks) throw new ApolloError('¡No ha sido posible cargar los productos!');
    else return rocks;
  }),
  rockSalesReport: authenticated(
    async (_, { filters: { rocks: oldRocks, start: oldStart, end: oldEnd, type } }) => {
      const allRocks = await Rock.find({ deleted: false }).select('id');
      const date = new Date();

      const start = new Date(oldStart || date.setFullYear(date.getFullYear() - 1));
      const end = new Date(oldEnd || date.setFullYear(date.getFullYear() + 1));

      const allRocksSummary = await Ticket.aggregate([
        {
          $match: {
            turn: { $exists: true },
            totalPrice: { $exists: true },
            outTruckImage: { $exists: true },
            bill: { $in: type !== null ? [type] : [true, false] },
            out: { $gte: start, $lte: end },
            product: {
              $in:
                oldRocks.length > 0
                  ? oldRocks.map(id => Types.ObjectId(id))
                  : allRocks.map(({ id }) => Types.ObjectId(id))
            }
          }
        },
        { $lookup: { from: 'users', localField: 'client', foreignField: '_id', as: 'client' } },
        { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
        { $lookup: { from: 'trucks', localField: 'truck', foreignField: '_id', as: 'truck' } },
        {
          $group: {
            _id: '$product',
            tickets: {
              $push: {
                id: '$_id',
                folio: '$folio',
                driver: '$driver',
                truck: '$truck',
                product: '$product',
                tax: '$tax',
                weight: '$weight',
                totalWeight: '$totalWeight',
                totalPrice: '$totalPrice',
                credit: '$credit',
                bill: '$bill',
                inTruckImage: '$inTruckImage',
                outTruckImage: '$outTruckImage'
              }
            },
            total: { $sum: '$totalPrice' }
          }
        },
        { $project: { _id: 0, rock: '$_id', tickets: '$tickets', total: '$total' } }
      ]);

      const rocks = allRocksSummary.map(({ rock, tickets, total }) => ({
        rock: { ...rock[0], id: rock[0]._id },
        tickets,
        total
      }));
      const total = rocks.reduce((total, rock) => (total += rock.total), 0);

      return { rocks, total };
    }
  ),
  rockMonthSalesReport: authenticated(
    async (_, { filters: { rocks: oldRocks, start: oldStart, end: oldEnd, type } }) => {
      const allRocks = await Rock.find({ deleted: false }).select('id');
      const date = new Date();

      const start = new Date(oldStart || date.setFullYear(date.getFullYear() - 1));
      const end = new Date(oldEnd || date.setFullYear(date.getFullYear() + 1));

      const allRocksMonthSummary = await Ticket.aggregate([
        {
          $match: {
            turn: { $exists: true },
            totalPrice: { $exists: true },
            outTruckImage: { $exists: true },
            bill: { $in: type !== null ? [type] : [true, false] },
            out: { $gte: start, $lte: end },
            product: {
              $in:
                oldRocks.length > 0
                  ? oldRocks.map(id => Types.ObjectId(id))
                  : allRocks.map(({ id }) => Types.ObjectId(id))
            }
          }
        },
        { $lookup: { from: 'users', localField: 'client', foreignField: '_id', as: 'client' } },
        { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
        { $lookup: { from: 'trucks', localField: 'truck', foreignField: '_id', as: 'truck' } },
        {
          $group: {
            _id: { $month: '$out' },
            products: {
              $addToSet: { product: '$product', total: { $sum: '$totalPrice' } }
            },
            total: { $sum: '$totalPrice' }
          }
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, month: '$_id', rocks: '$products', total: '$total' } }
      ]);

      allRocksMonthSummary.forEach((summary, i) => {
        const rocks = {};

        summary.rocks.forEach(({ product, total }) => {
          if (rocks[product[0]._id]) {
            rocks[product[0]._id].total += total;
          } else {
            rocks[product[0]._id] = {};
            rocks[product[0]._id] = { ...product[0], total };
          }
        });

        allRocksMonthSummary[i].rocks = [...Object.values(rocks).map(rock => rock)];
      });

      const monthSummary = allRocksMonthSummary.map(({ month, rocks, total }) => ({
        month: months[month - 1],
        rocks,
        total: parseInt(total.toFixed(2), 10)
      }));

      return { monthSummary };
    }
  )
};

export default rockQueries;
