import { Blast } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const blastQueries = {
  blast: authenticated(async (_, { id }) => {
    const blast = await Blast.findById(id).populate('createdBy products.product');

    if (!blast) throw new Error('¡No ha sido posible encontrar la voladura!');

    return blast;
  }),
  blasts: authenticated(async (_, { filters: { limit } }) => {
    const blasts = await Blast.find({ deleted: false })
      .limit(limit || Number.MAX_SAFE_INTEGER)
      .populate('createdBy products.product');

    if (!blasts) throw new Error('¡No ha sido posible cargar las voladuras!');

    return blasts;
  })
};

export default blastQueries;
