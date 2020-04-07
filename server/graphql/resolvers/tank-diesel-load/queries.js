import { ApolloError } from 'apollo-server';
import { TankDieselLoad } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const tankDieselLoadQueries = {
  tankDieselLoad: authenticated(async (_, args) => {
    const { id } = args;
    const tankDieselLoad = await TankDieselLoad.findById(id).populate('registeredBy');

    if (!tankDieselLoad) throw new Error('¡No ha sido posible encontrar este registro!');

    return tankDieselLoad;
  }),
  tankDieselLoads: authenticated(async (_, { filters: { limit, search } }) => {
    const tankDieselLoads = await TankDieselLoad.find({
      deleted: false,
      $or: [
        { reference: { $in: [new RegExp(search, 'i')] } },
        { comments: { $in: [new RegExp(search, 'i')] } }
      ]
    })
      .sort({ date: -1 })
      .limit(limit || Number.MAX_SAFE_INTEGER)
      .populate('registeredBy');

    if (!tankDieselLoads)
      throw new ApolloError('¡No ha sido posible cargar el historial de registros de ingresos!');
    else return tankDieselLoads;
  })
};

export default tankDieselLoadQueries;
