import { SupplyTrainsactionIn, SupplyTrainsactionOut } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const supplyTransactionQueries = {
  supplyTransactionsIn: authenticated(async (_, { filters: { limit } }) => {
    const supplies = await SupplyTrainsactionIn.find({ deleted: false })
      .populate('supply createdBy')
      .limit(limit);

    if (!supplies) throw new Error('¡No ha sido posible cargar los suministros!');

    return supplies;
  }),
  supplyTransactionsOut: authenticated(async (_, { filters: { limit } }) => {
    const supplies = await SupplyTrainsactionOut.find({ deleted: false })
      .populate('supply machine createdBy')
      .limit(limit);

    if (!supplies) throw new Error('¡No ha sido posible cargar los suministros!');

    return supplies;
  })
};

export default supplyTransactionQueries;
