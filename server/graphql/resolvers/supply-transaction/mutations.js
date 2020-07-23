import authenticated from '../../middleware/authenticated';
import { Supply, SupplyTrainsactionIn, SupplyTrainsactionOut } from '../../../mongo-db/models';

const supplyTransactionMutations = {
  supplyTransactionIn: authenticated(async (_, args, { req: { userRequesting } }) => {
    const supplyTransaction = new SupplyTrainsactionIn({ ...args.supplyTransactionIn });

    supplyTransaction.createdBy = userRequesting.id;
    supplyTransaction.createdAt = new Date();

    await supplyTransaction.save();
    await Supply.findByIdAndUpdate(supplyTransaction.supply, {
      $inc: { quantity: supplyTransaction.quantity }
    });

    return SupplyTrainsactionIn.findById(supplyTransaction.id).populate('supply createdBy');
  }),
  supplyTransactionOut: authenticated(async (_, args, { req: { userRequesting } }) => {
    const supplyTransaction = new SupplyTrainsactionOut({ ...args.supplyTransactionOut });
    const supply = await Supply.findById(supplyTransaction.supply);

    if (supply.quantity < supplyTransaction.quantity) throw new Error('No hay suministro disponible para la cantidad requerida. Realice un ajuste si es necesario!');

    supplyTransaction.createdBy = userRequesting.id;
    supplyTransaction.createdAt = new Date();
    supply.quantity -= supplyTransaction.quantity;

    await supplyTransaction.save();
    await supply.save();

    return SupplyTrainsactionOut.findById(supplyTransaction.id).populate('supply machine createdBy');
  }),
  supplyTransactionInDelete: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    try {
      const supplyTransaction = await SupplyTrainsactionIn.findById(id);

      await SupplyTrainsactionIn.deleteById(id, userRequesting.id);
      await Supply.findByIdAndUpdate(supplyTransaction.supply, {
        $inc: { quantity: supplyTransaction.quantity * -1 }
      });
      return true;
    } catch (e) {
      return e;
    }
  }),
  supplyTransactionOutDelete: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    try {
      const supplyTransaction = await SupplyTrainsactionOut.findById(id);

      await SupplyTrainsactionOut.deleteById(id, userRequesting.id);
      await Supply.findByIdAndUpdate(supplyTransaction.supply, {
        $inc: { quantity: supplyTransaction.quantity }
      });
      return true;
    } catch (e) {
      return e;
    }
  })
};

export default supplyTransactionMutations;