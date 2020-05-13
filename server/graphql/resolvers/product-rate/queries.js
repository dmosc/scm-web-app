import { ProductRate } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const productRateQueries = {
  productRate: authenticated(async () => {
    try {
      return ProductRate.findOne({});
    } catch (e) {
      return e;
    }
  })
};

export default productRateQueries;
