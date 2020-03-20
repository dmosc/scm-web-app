import { ClientPrice, Rock } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const clientPriceQueries = {
  clientPricesByClient: authenticated(async (_, { client }) => {
    // Get all rocks
    const rocks = await Rock.find();

    // Return the most recent
    const pricesPerRockPromise = rocks.map(
      ({ id }) => ClientPrice.find({ rock: id, client }).sort({ addedAt: 'descending' })[0]
    );

    const pricesPerRock = await Promise.all(pricesPerRockPromise);

    // Filter not nulls and not noSpecialPrice flag
    return pricesPerRock.filter(price => price && !price.noSpecialPrice);
  }),
  clientPriceByClient: authenticated(async (_, { client, rock }) =>
    ClientPrice.findOne({ client, rock, noSpecialPrice: false })
  )
};

export default clientPriceQueries;
