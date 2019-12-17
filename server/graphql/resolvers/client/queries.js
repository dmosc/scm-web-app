import {Client} from '../../../database/models/index';
import authenticated from '../../middleware/authenticated';

const clientQueries = {
  client: authenticated(async (_, args) => {
    const {id} = args;
    const client = await Client.findById(id).populate('trucks');

    if (!client) throw new Error('Client does not exist!');

    return client;
  }),
  clients: authenticated(async (_, {filters: {limit}}) => {
    const clients = await Client.find({})
      .limit(limit || 50)
      .populate('trucks');

    if (!clients) throw new Error('Could not fetch clients!');

    return clients;
  }),
};

export default clientQueries;
