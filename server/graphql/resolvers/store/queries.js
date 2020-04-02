import { Store } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const storeQueries = {
  store: authenticated(async (_, args) => {
    const { id } = args;
    const store = await Store.findById(id);

    if (!store) throw new Error('¡No se ha podido encontrar la tienda requerida!');

    return store;
  }),
  stores: authenticated(async (_, { client }) => {
    const stores = await Store.find({ deleted: false, disabled: false, client });

    if (!stores) throw new Error('¡No se han podido cargar las tiendas correctamente!');

    return stores;
  })
};

export default storeQueries;
