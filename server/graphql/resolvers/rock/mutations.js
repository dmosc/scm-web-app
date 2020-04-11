import { Rock } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const rockMutations = {
  rock: authenticated(async (_, args) => {
    const rock = new Rock({ ...args.rock });

    rock.name = rock.name.trim().toUpperCase();
    rock.color = rock.color.trim().toUpperCase();

    try {
      await rock.save();
      return rock;
    } catch (e) {
      return e;
    }
  }),
  rockEdit: authenticated(async (_, args) => {
    const rock = await Rock.findOne({ _id: args.rock.id });

    Object.keys(args.rock).forEach(field => {
      rock[field] = args.rock[field];
    });

    // EDIT MUST USE .save() OPERATION TO RUN
    // MODEL VALIDATIONS CORRECTLY. PLEASE AVOID
    // findOneAndUpdate or similars
    return rock.save();
  }),
  rockDelete: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    try {
      await Rock.deleteById(id, userRequesting.id);
      return true;
    } catch (e) {
      return e;
    }
  })
};

export default rockMutations;
