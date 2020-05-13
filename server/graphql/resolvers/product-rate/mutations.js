import { ProductRate } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const productRateMutations = {
  productRate: authenticated(async (_, args) => {
    let productRate;
    const productRateExists = await ProductRate.findOne({});

    if (productRateExists) {
      productRate = productRateExists;
      productRate.rate = args.rate;
    } else {
      productRate = new ProductRate({ rate: args.rate });
    }

    try {
      await productRate.save();
      return productRate;
    } catch (e) {
      return e;
    }
  })
};

export default productRateMutations;
