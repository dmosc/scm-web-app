import { Client, Truck } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const truckMutations = {
  truck: authenticated(async (_, args) => {
    const truck = new Truck({ ...args.truck });

    truck.plates = truck.plates.toUpperCase();
    truck.brand = truck.brand.toUpperCase();
    truck.model = truck.model.toUpperCase();
    truck.weight = truck.weight.toFixed(2);
    truck.drivers = truck.drivers.map(driver => driver.toUpperCase());

    const clientWithTruckExists = await Truck.findOne({
      plates: truck.plates,
      client: truck.client
    });

    if (clientWithTruckExists)
      throw new Error('¡Este camión ya ha sido registrado para el mismo cliente!');

    const client = await Client.findOneAndUpdate(
      { _id: args.truck.client },
      { $push: { trucks: truck._id } }
    );

    if (!client) throw new Error('¡El cliente no existe!');

    try {
      await truck.save();
      await client.save();

      return await Truck.findById(truck.id).populate('client');
    } catch (e) {
      return e;
    }
  }),
  truckEdit: authenticated(async (_, args) => {
    try {
      const newTruck = { ...args.truck };
      const { id } = newTruck;

      newTruck.plates = newTruck.plates ? newTruck.plates.toUpperCase() : undefined;
      newTruck.brand = newTruck.brand ? newTruck.brand.toUpperCase() : undefined;
      newTruck.model = newTruck.model ? newTruck.model.toUpperCase() : undefined;
      newTruck.weight = newTruck.weight ? newTruck.weight.toFixed(2) : undefined;
      newTruck.drivers = newTruck.drivers
        ? newTruck.drivers.map(driver => driver.toUpperCase())
        : undefined;

      const operations = [
        Truck.findOneAndUpdate({ _id: args.truck.id }, { ...newTruck }, { new: true }).populate(
          'client'
        )
      ];

      if (newTruck.client) {
        operations.push(Client.findOne({ trucks: id }, { $pull: { trucks: id } }));
        operations.push(Client.findOne({ _id: newTruck.client }, { $push: { trucks: id } }));
      }

      const [truck] = await Promise.all(operations);

      return truck;
    } catch (e) {
      return e;
    }
  }),
  truckDelete: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    try {
      await Truck.deleteById(id, userRequesting.id);
      return true;
    } catch (e) {
      return e;
    }
  })
};

export default truckMutations;
