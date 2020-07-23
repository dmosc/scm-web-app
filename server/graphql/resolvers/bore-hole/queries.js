import { BoreHole } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const boreHoleQueries = {
  boreHole: authenticated(async (_, { id }) => {
    const boreHole = await BoreHole.findById(id).populate('createdBy machine');

    if (!boreHole) throw new Error('¡No ha sido posible encontrar la barrenación!');

    return boreHole;
  }),
  boreHoles: authenticated(async (_, { filters: { limit, search } }) => {
    const regexSearch = new RegExp(search, 'i');
    const boreHoles = await BoreHole.aggregate([
      { $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'createdBy' } },
      { $lookup: { from: 'machines', localField: 'machine', foreignField: '_id', as: 'machine' } },
      { $unwind: '$createdBy' },
      { $unwind: '$machine' },
      {
        $match: {
          $or: [
            { folio: { $in: [regexSearch] } },
            { 'createdBy.firstName': { $in: [regexSearch] } },
            { 'createdBy.lastName': { $in: [regexSearch] } },
            { 'createdBy.username': { $in: [regexSearch] } },
            { 'createdBy.role': { $in: [regexSearch] } },
            { 'machine.name': { $in: [regexSearch] } },
            { 'machine.type': { $in: [regexSearch] } },
            { 'machine.plates': { $in: [regexSearch] } },
            { 'machine.brand': { $in: [regexSearch] } },
            { 'machine.model': { $in: [regexSearch] } }
          ]
        }
      },
      { $limit: limit || Number.MAX_SAFE_INTEGER },
      { $sort: { date: -1 } },
      {
        $project: {
          id: '$_id',
          _id: 0,
          folio: '$folio',
          date: '$date',
          meters: '$meters',
          createdAt: '$createdAt',
          createdBy: '$createdBy',
          machine: '$machine'
        }
      }
    ]);

    if (!boreHoles) throw new Error('¡No ha sido posible cargar las barrenaciones!');

    return boreHoles;
  })
};

export default boreHoleQueries;
