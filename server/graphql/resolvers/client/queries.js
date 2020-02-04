import { Client } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const clientQueries = {
  client: authenticated(async (_, args) => {
    const { id } = args;
    const client = await Client.findById(id).populate('trucks');

    if (!client) throw new Error('¡El cliente no existe!');

    return client;
  }),
  clients: authenticated(async (_, { filters: { limit, search } }) => {
    const clients = await Client.find({
      $or: [
        { firstName: { $in: [new RegExp(search, 'i')] } },
        { lastName: { $in: [new RegExp(search, 'i')] } },
        { businessName: { $in: [new RegExp(search, 'i')] } }
      ]
    })
      .limit(limit || 50)
      .populate('trucks');

    if (!clients) throw new Error('¡No ha sido posible cargar los clientes!');

    return clients;
  })
};

export default clientQueries;
