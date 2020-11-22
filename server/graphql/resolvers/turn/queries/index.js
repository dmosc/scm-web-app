import { Ticket, Turn } from '../../../../mongo-db/models';
import authenticated from '../../../middleware/authenticated';
import turnReports from './reports';

const turnQueries = {
  turn: authenticated(async (_, args) => {
    const { id } = args;
    const turn = await Turn.findOne({ _id: id }).populate('user');

    if (!turn) throw new Error('¡No ha sido posible encontrar el turno!');

    return turn;
  }),
  turns: authenticated(
    async (
      _,
      { filters: { limit, start = new Date('1970-01-01'), end = new Date('2100-12-31') } }
    ) => {
      const query = {};
      if (start) query.start = { $gte: start };
      if (end) query.end = { $lte: end };
      const turns = await Turn.find(query)
        .limit(limit || Number.MAX_SAFE_INTEGER)
        .populate('user');

      if (!turns) throw new Error('¡Ha habido un error cargando los turnos!');

      return turns;
    }
  ),
  turnActive: authenticated(() => {
    return Turn.findOne({ end: { $exists: false } });
  }),
  turnSummary: authenticated(async (_, { uniqueId, ticketType }) => {
    const turn = await Turn.findOne({ uniqueId });

    const $match = {
      turn: turn._id,
      totalPrice: { $exists: true },
      outTruckImage: { $exists: true }
    };

    switch (ticketType) {
      case 'CASH':
        $match.credit = false;
        break;
      case 'CREDIT':
        $match.credit = true;
        break;
      default:
        break;
    }

    const clients = await Ticket.aggregate([
      {
        $match
      },
      { $lookup: { from: 'users', localField: 'client', foreignField: '_id', as: 'client' } },
      { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
      { $lookup: { from: 'trucks', localField: 'truck', foreignField: '_id', as: 'truck' } },
      {
        $group: {
          _id: '$client',
          count: { $sum: 1 },
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
              inTruckImage: '$inTruckImage',
              outTruckImage: '$outTruckImage'
            }
          }
        }
      },
      { $project: { _id: 0, info: '$_id', count: '$count', tickets: '$tickets' } }
    ]);

    if (clients.length === 0)
      return { clients, upfront: 0, credit: 0, total: 0, upfrontWeight: 0, creditWeight: 0 };

    let upfront = 0;
    let credit = 0;
    let total = 0;
    let upfrontWeight = 0;
    let creditWeight = 0;
    for (const client of clients) {
      const { tickets } = client;
      for (const ticket of tickets) {
        if (ticket.credit) {
          credit += ticket.totalPrice - ticket.tax;
          creditWeight += ticket.totalWeight;
        } else {
          upfront += ticket.totalPrice - ticket.tax;
          upfrontWeight += ticket.totalWeight;
        }

        total += ticket.totalPrice - ticket.tax;
      }
    }

    for (let i = 0; i < clients.length; i++) {
      // Parse data and remove generated arrays from $lookups
      clients[i].info = { ...clients[i].info[0] };
      clients[i].info.id = clients[i].info._id;
      delete clients[i].info._id;

      const { tickets } = clients[i];
      for (const ticket of tickets) {
        ticket.product = { ...ticket.product[0] };
        ticket.truck = { ...ticket.truck[0] };

        ticket.product.id = ticket.product._id;
        ticket.truck.id = ticket.truck._id;

        delete ticket.product._id;
        delete ticket.truck._id;
      }
    }

    return { clients, upfront, credit, total, upfrontWeight, creditWeight };
  }),
  turnMostRecentlyOpened: async () => {
    const turn = await Turn.find({ end: { $exists: false } }).populate('user');

    return turn[0];
  },
  turnMostRecentlyEnded: async () => {
    const turn = await Turn.find({ end: { $exists: true } })
      .populate('user')
      .sort({ end: -1 });

    return turn[0];
  },
  turnByUniqueId: async (_, { uniqueId }) => Turn.findOne({ uniqueId }).populate('user'),
  ...turnReports
};

export default turnQueries;
