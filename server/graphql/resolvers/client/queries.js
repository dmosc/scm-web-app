import { Client, Ticket } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const clientQueries = {
  client: authenticated(async (_, args) => {
    const { id } = args;
    const client = await Client.findOne({ _id: id, deleted: false })
      .populate('trucks')
      .populate('prices.rock');

    if (!client) throw new Error('¡El cliente no existe!');

    return client;
  }),
  clients: authenticated(async (_, { filters: { limit, search } }) => {
    const clients = await Client.find({
      deleted: false,
      $or: [
        { firstName: { $in: [new RegExp(search, 'i')] } },
        { lastName: { $in: [new RegExp(search, 'i')] } },
        { businessName: { $in: [new RegExp(search, 'i')] } },
        { email: { $in: [new RegExp(search, 'i')] } },
        { phone: { $in: [new RegExp(search, 'i')] } }
      ]
    })
      .populate('trucks')
      .populate('prices.rock')
      .limit(limit || Number.MAX_SAFE_INTEGER);

    if (!clients) throw new Error('¡No ha sido posible cargar los clientes!');

    return clients;
  }),
  clientsPendingTicketsToBill: authenticated(async () => {
    const clients = await Ticket.aggregate([
      {
        $match: {
          turn: { $exists: true },
          totalPrice: { $exists: true },
          outTruckImage: { $exists: true },
          bill: true,
          isBilled: false,
          disabled: false
        }
      },
      { $lookup: { from: 'users', localField: 'client', foreignField: '_id', as: 'client' } },
      {
        $group: { _id: '$client', count: { $sum: 1 } }
      },
      { $project: { _id: 0, client: '$_id', count: '$count' } }
    ]);

    for (let i = 0; i < clients.length; i++) {
      const client = {
        client: clients[i].client[0],
        count: clients[i].count
      };

      client.client.id = client.client._id;
      delete client.client._id;

      clients[i] = { ...client };
    }

    if (!clients) throw new Error('¡No ha sido posible cargar los clientes!');

    return clients;
  })
};

export default clientQueries;
