import authenticated from '../../middleware/authenticated';
import { Supply } from '../../../mongo-db/models';

const supplyMutations = {
  supply: authenticated(async (_, args) => {
    const supply = new Supply({ ...args.supply });

    supply.name = supply.name.toUpperCase();
    supply.type = supply.type.toUpperCase();
    supply.unit = supply.unit.toUpperCase();

    await supply.save();

    return Supply.findById(supply.id);
  }),
  supplyEdit: authenticated(async (_, args) => {
    return Supply.findByIdAndUpdate(args.supply.id,
      { ...args.supply },
      { new: true });
  }),
  supplyDelete: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    try {
      await Supply.deleteById(id, userRequesting.id);
      return true;
    } catch (e) {
      return e;
    }
  })
};

export default supplyMutations;