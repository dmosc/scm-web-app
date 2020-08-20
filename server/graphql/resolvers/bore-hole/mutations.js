import authenticated from '../../middleware/authenticated';
import { BoreHole, Folio } from '../../../mongo-db/models';

const boreHoleMutations = {
  boreHole: authenticated(async (_, args, { req: { userRequesting } }) => {
    const boreHole = new BoreHole({ ...args.boreHole });

    let folio;
    folio = await Folio.findOneAndUpdate(
      { name: 'S' },
      { $inc: { count: 1 } },
      { new: false }
    ).select('name count');

    if (!folio) {
      folio = new Folio({ name: 'S', count: '10000' });
      await folio.save();
      folio = await Folio.findOneAndUpdate(
        { name: 'S' },
        { $inc: { count: 1 } },
        { new: false }
      ).select('name count');
    }

    boreHole.createdAt = new Date();
    boreHole.createdBy = userRequesting.id;
    boreHole.folio = folio.name.toString() + folio.count.toString();

    await boreHole.save();

    return BoreHole.findById(boreHole.id).populate('createdBy machine');
  }),
  boreHoleEdit: authenticated(async (_, args) => {
    return BoreHole.findByIdAndUpdate(
      args.boreHole.id,
      { ...args.boreHole },
      { new: true }
    ).populate('createdBy machine');
  }),
  boreHoleDelete: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    try {
      await BoreHole.deleteById(id, userRequesting.id);
      return true;
    } catch (e) {
      return e;
    }
  })
};

export default boreHoleMutations;
