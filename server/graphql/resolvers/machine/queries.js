import { ApolloError } from 'apollo-server';
import { Machine } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const machineQueries = {
  machine: authenticated(async (_, args) => {
    const { id } = args;
    const machine = await Machine.findById(id);

    if (!machine) throw new Error('¡No existe esta máquina!');

    return machine;
  }),
  machines: authenticated(async (_, { filters: { limit, search } }) => {
    const machines = await Machine.find({
      deleted: false,
      $or: [
        { name: { $in: [new RegExp(search, 'i')] } },
        { type: { $in: [new RegExp(search, 'i')] } },
        { plates: { $in: [new RegExp(search, 'i')] } },
        { brand: { $in: [new RegExp(search, 'i')] } },
        { model: { $in: [new RegExp(search, 'i')] } }
      ]
    }).limit(limit || Number.MAX_SAFE_INTEGER);

    if (!machines) throw new ApolloError('¡No ha sido posible cargar las máquinas!');
    else return machines;
  })
};

export default machineQueries;
