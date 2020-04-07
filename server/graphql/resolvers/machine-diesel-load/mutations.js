import { MachineDieselLoad } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const machineDieselLoadMutations = {
  machineDieselLoad: authenticated(async (_, args, { req: { userRequesting } }) => {
    const machineDieselLoad = new MachineDieselLoad({ ...args.machineDieselLoad });

    machineDieselLoad.date = Date.now();
    machineDieselLoad.driver = machineDieselLoad.driver.toUpperCase();
    machineDieselLoad.registeredBy = userRequesting.id;

    try {
      await machineDieselLoad.save();
      return MachineDieselLoad.findById(machineDieselLoad.id).populate('machine registeredBy');
    } catch (e) {
      return e;
    }
  })
};

export default machineDieselLoadMutations;
