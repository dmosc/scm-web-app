import authenticated from '../../middleware/authenticated';
import { BlastProduct } from '../../../mongo-db/models';

const blastProductMutations = {
  blastProduct: authenticated(async (_, args) => {
    const blastProduct = new BlastProduct({ ...args.blastProduct });

    blastProduct.name = blastProduct.name.toUpperCase();

    await blastProduct.save();

    return blastProduct;
  })
};

export default blastProductMutations;