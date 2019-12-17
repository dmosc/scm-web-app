import {Truck, Client} from '../../../database/models';
import authenticated from '../../middleware/authenticated';

const truckMutations = {
  truck: authenticated(async (_, args) => {
    const truck = new Truck({...args.truck});

    truck.plates = truck.plates.toUpperCase();
    truck.brand = truck.brand.toUpperCase();
    truck.model = truck.model.toUpperCase();
    truck.weight = truck.weight.toFixed(2);
    truck.drivers = truck.drivers.map(driver => driver.toUpperCase());

    const client = await Client.findOneAndUpdate(
      {_id: args.truck.client},
      {$push: {trucks: truck._id}}
    );

    if (!client) throw new Error('Client does not exists!');

    try {
      await truck.save();
      await client.save();

      return truck;
    } catch (e) {
      return e;
    }
  }),
};

export default truckMutations;
