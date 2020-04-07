import { TankDieselLoad } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const tankDieselLoadMutations = {
  tankDieselLoad: authenticated(async (_, args, { req: { userRequesting } }) => {
    const tankDieselLoad = new TankDieselLoad({ ...args.tankDieselLoad });

    tankDieselLoad.date = Date.now();
    tankDieselLoad.registeredBy = userRequesting.id;

    try {
      await tankDieselLoad.save();
      return TankDieselLoad.findById(tankDieselLoad.id).populate('registeredBy');
    } catch (e) {
      return e;
    }
  })
};

export default tankDieselLoadMutations;
