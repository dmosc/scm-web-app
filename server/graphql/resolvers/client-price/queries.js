import { ClientPrice, Rock } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const clientPriceQueries = {
  clientPricesByClient: authenticated(async (_, { client }) => {
    // Get all rocks
    const rocks = await Rock.find();

    const pricesPerRockPromise = rocks.map(({ id }) =>
      ClientPrice.find({ rock: id, client })
        .populate('rock')
        .sort({ addedAt: 'descending' })
    );

    const pricesPerRock = await Promise.all(pricesPerRockPromise);

    return (
      pricesPerRock
        // First element will always be the most recent, which is considered the 'active'
        .map(rockPrices => rockPrices[0])
        // Filter not nulls and not noSpecialPrice flag
        .filter(price => price && !price.noSpecialPrice)
    );
  }),
  clientPriceByClient: authenticated(async (_, { client, rock }) => {
    const clientPrices = await ClientPrice.find({ client, rock })
      .populate('rock')
      .sort({ addedAt: 'descending' });

    if (!clientPrices[0] || clientPrices[0].noSpecialPrice) return null;
    return clientPrices[0];
  }),
  clientPriceHistoryByClient: authenticated(async (_, { client, rock }) => {
    const query = { client };

    if (rock) query.rock = rock;

    return ClientPrice.find(query)
      .populate('rock setBy')
      .sort({ addedAt: 'descending' });
  })
};

export default clientPriceQueries;
