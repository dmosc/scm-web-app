import { Quotation } from '../../../mongo-db/models';

const quotationQueries = {
  quotation: async (_, { id }) => Quotation.findOne({ _id: id }),
  quotations: async (_, { filters }) => {
    const { client, validRange = {}, createdRange = {} } = filters;

    const query = {
      deleted: false,
      validUntil: {
        $gte: new Date(validRange.start || '1970-01-01T00:00:00.000Z'),
        $lte: new Date(validRange.end || '2100-12-31T00:00:00.000Z')
      },
      createdAt: {
        $gte: new Date(createdRange.start || '1970-01-01T00:00:00.000Z'),
        $lte: new Date(createdRange.end || '2100-12-31T00:00:00.000Z')
      }
    };

    if (client) query.client = new RegExp(client, 'i');

    return Quotation.find(query).populate('products.rock');
  }
};

export default quotationQueries;
