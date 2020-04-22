import { Quotation, Folio } from '../../../mongo-db/models';

const quotationMutations = {
  quotation: async (_, { quotation }) => {
    const folio = await Folio.findOneAndUpdate(
      { name: 'Q' },
      { $inc: { count: 1 } },
      { new: false }
    ).select('name count');

    const quotationToSave = new Quotation({
      ...quotation,
      folio: folio.name.toString() + folio.count.toString()
    });

    return quotationToSave.save();
  }
};

export default quotationMutations;
