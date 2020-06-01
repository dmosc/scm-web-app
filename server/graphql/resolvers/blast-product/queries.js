import { BlastProduct } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const blastProductQueries = {
  blastProduct: authenticated(async (_, { id }) => {
    const blastProduct = await BlastProduct.findById(id);

    if (!blastProduct) throw new Error('¡No ha sido posible encontrar el producto!');

    return blastProduct;
  }),
  blastProducts: authenticated(async (_, { filters: { limit, search } }) => {
    const blastProducts = await BlastProduct.find({
      deleted: false,
      name: new RegExp(search, 'i')
    }).limit(limit || Number.MAX_SAFE_INTEGER);

    if (!blastProducts) throw new Error('¡No ha sido posible cargar los productos!');

    return blastProducts;
  })
};

export default blastProductQueries;
