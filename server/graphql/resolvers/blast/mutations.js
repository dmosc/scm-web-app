import authenticated from '../../middleware/authenticated';
import { Blast } from '../../../mongo-db/models';

const blastMutations = {
  blast: authenticated(async (_, args, { req: { userRequesting } }) => {
    const blast = new Blast({ ...args.blast });

    blast.createdBy = userRequesting.id;

    await blast.save();

    return Blast.findById(blast.id).populate('createdBy products.product');
  })
};

export default blastMutations;