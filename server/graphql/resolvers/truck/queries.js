import { Truck } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const truckQueries = {
  truck: authenticated(async (_, args) => {
    const { id, plates } = args;
    const truck = await Truck.findOne({
      deleted: false,
      $or: [{ _id: id }, { plates }]
    }).populate('client');

    if (!truck) throw new Error('¡El camión no existe!');

    return truck;
  }),
  trucks: authenticated(async (_, { filters: { limit, search } }) => {
    const trucks = await Truck.find({
      deleted: false,
      $or: [
        { plates: { $in: [new RegExp(search, 'i')] } },
        { brand: { $in: [new RegExp(search, 'i')] } },
        { model: { $in: [new RegExp(search, 'i')] } },
        { drivers: { $in: [new RegExp(search, 'i')] } }
      ]
    })
      .limit(limit || 50)
      .populate('client');

    if (!trucks) throw new Error('¡No ha sido posible cargar los camiones!');

    return trucks;
  })
};

export default truckQueries;
