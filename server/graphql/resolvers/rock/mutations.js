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
    const rock = await Rock.findOne({ _id: args.rock.id });

    Object.keys(args.rock).forEach(field => {
      rock[field] = args.rock[field];
    });

    // EDIT MUST USE .save() OPERATION TO RUN
    // MODEL VALIDATIONS CORRECTLY. PLEASE AVOID
    // findOneAndUpdate or similars
    return rock.save();
  })
};

export default rockMutations;
