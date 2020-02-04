import { Rock } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const rockMutations = {
  rock: authenticated(async (_, args) => {
    const rock = new Rock({ ...args.rock });
    rock.name = rock.name.toUpperCase();

    try {
      await rock.save();
      return rock;
    } catch (e) {
      return e;
    }
  }),
  rockEdit: authenticated(async (_, args) => {
    try {
      const rock = await Rock.findOneAndUpdate(
        { _id: args.rock.id },
        { ...args.rock },
        { new: true }
      );

      return rock;
    } catch (e) {
      return e;
    }
  })
};

export default rockMutations;
