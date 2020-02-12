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
      const oldTruck = await Truck.findOneAndUpdate(
        { _id: args.truck.id },
        { ...args.truck },
        { new: false }
      );

      const truck = await Truck.findById(oldTruck.id).populate('client');

      truck.plates = truck.plates.toUpperCase();
      truck.brand = truck.brand.toUpperCase();
      truck.model = truck.model.toUpperCase();
      truck.weight = truck.weight.toFixed(2);
      truck.drivers = truck.drivers.map(driver => driver.toUpperCase());

      const oldClient = await Client.findById(oldTruck.client);
      const newClient = await Client.findById(truck.client);

      oldClient.trucks.pull({ _id: truck.id });
      newClient.trucks.push({ _id: truck.id });

      await oldClient.save();
      await newClient.save();
      await truck.save();

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
