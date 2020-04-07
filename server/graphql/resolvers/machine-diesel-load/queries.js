import { ApolloError } from 'apollo-server';
import { MachineDieselLoad } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const machineDieselLoadQueries = {
  machineDieselLoad: authenticated(async (_, args) => {
    const { id } = args;
    const machineDieselLoad = await MachineDieselLoad.findById(id).populate('machine registeredBy');

    if (!machineDieselLoad) throw new Error('¡No ha sido posible encontrar este registro!');

    return machineDieselLoad;
  }),
  machineDieselLoads: authenticated(async (_, { filters: { limit, search } }) => {
    const machineDieselLoads = await MachineDieselLoad.find({
      deleted: false,
      $or: [{ driver: { $in: [new RegExp(search, 'i')] } }]
    })
      .sort({ date: -1 })
      .limit(limit || Number.MAX_SAFE_INTEGER)
      .populate('machine registeredBy');

    if (!machineDieselLoads)
      throw new ApolloError('¡No ha sido posible cargar el historial de registros de egresos!');
    else return machineDieselLoads;
  })
};

export default machineDieselLoadQueries;
