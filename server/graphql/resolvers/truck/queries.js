import {Truck} from '../../../database/models';
import authenticated from '../../middleware/authenticated';

const truckQueries = {
  truck: authenticated(async (_, args) => {
    const {id} = args;
    const truck = await Truck.findById(id).populate('client');

    if (!truck) throw new Error('Truck does not exists!');

    return truck;
  }),
  trucks: authenticated(async (_, {filters: {limit}}) => {
    const trucks = await Truck.find({}).limit(limit || 50);

    if (!trucks) throw new Error("Couldn't find any truck does not exists!");

    return trucks;
  }),
};

export default truckQueries;
