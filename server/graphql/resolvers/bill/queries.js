import { Bill } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const billQueries = {
  bill: authenticated(async (_, { id, folio }) => {
    const bill = await Bill.findOne({
      $or: [{ _id: id }, { folio }]
    }).populate('client store');

    if (!bill) throw new Error('¡No ha sido posible encontrar esta factura!');

    return bill;
  }),
  bills: authenticated(async (_, { filters: { limit, search } }) => {
    const bills = await Bill.find({
      deleted: false,
      $or: [{ folio: { $in: [new RegExp(search, 'i')] } }]
    })
      .limit(limit || Number.MAX_SAFE_INTEGER)
      .populate('client store');

    if (!bills) throw new Error('¡No ha sido posible cargar las facturas!');

    return bills;
  })
};

export default billQueries;
