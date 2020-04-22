import { Quotation } from '../../../mongo-db/models';

const quotationMutations = {
  quotation: async (_, { quotation }) => {
    const quotationToSave = new Quotation(quotation);

    return quotationToSave.save();
  }
};

export default quotationMutations;
