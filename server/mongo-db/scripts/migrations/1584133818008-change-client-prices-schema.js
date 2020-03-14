import { Client, Rock } from '../../models';

const up = async next => {
  console.info('Up change client prices schema');

  const [clients, rocks] = await Promise.all([Client.find(), Rock.find()]);

  const rockNameToIdMap = {};

  rocks.forEach(({ id, name }) => {
    rockNameToIdMap[name] = id;
  });

  const updatePromise = clients.map(client => {
    const newPricesWithNaNs = Object.keys(client.prices).map(key => {
      return {
        rock: rockNameToIdMap[key],
        price: client.prices[key]
      };
    });

    // Some prices were with NaN values, this will remove them
    const newPrices = [];

    newPricesWithNaNs.forEach(newPrice => {
      if (!Number.isNaN(newPrice.price)) newPrices.push(newPrice);
    });

    return Client.updateOne({ _id: client.id }, { $set: { newPrices } });
  });

  await Promise.all(updatePromise);

  console.info('Client prices schema changed correctly');

  next();
};

export { up };
