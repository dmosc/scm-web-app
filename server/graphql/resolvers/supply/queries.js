import { Supply } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const supplyQueries = {
  supply: authenticated(async (_, { id }) => {
    const supply = await Supply.findById(id);

    if (!supply) throw new Error('¡No ha sido posible encontrar el suministro!');

    return supply;
  }),
  supplies: authenticated(async (_, { filters: { limit, search } }) => {
    const regexSearch = new RegExp(search, 'i');
    const supplies = await Supply.find({ name: regexSearch }).limit(limit);

    if (!supplies) throw new Error('¡No ha sido posible cargar los suministros!');

    return supplies;
  })
};

export default supplyQueries;
