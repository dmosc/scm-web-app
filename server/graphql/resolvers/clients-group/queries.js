import { ApolloError } from 'apollo-server';
import { ClientsGroup } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const clientsGroupQueries = {
  clientsGroup: authenticated(async (_, args) => {
    const { id } = args;
    const clientsGroup = await ClientsGroup.findById(id).populate('clients');

    if (!clientsGroup) throw new Error('¡No se ha podido encontrar el grupo!');

    return clientsGroup;
  }),
  clientsGroups: authenticated(async (_, { filters: { limit, search } }) => {
    const clientsGroups = await ClientsGroup.find({
      deleted: false,
      name: { $in: [new RegExp(search, 'i')] }
    })
      .limit(limit || Number.MAX_SAFE_INTEGER)
      .populate('clients');

    if (!clientsGroups) throw new ApolloError('¡No ha sido posible cargar los grupos!');
    else return clientsGroups;
  })
};

export default clientsGroupQueries;
