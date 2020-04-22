import { Quotation } from '../../../mongo-db/models';

const quotationQueries = {
  quotation: async (_, { id }) => Quotation.findOne({ _id: id }),
  quotations: async (_, { filters }) => {
    const {
      client,
      validRange = { start: '1970-01-01T00:00:00.000Z', end: '2100-12-31T00:00:00.000Z' },
      createdRange = { start: '1970-01-01T00:00:00.000Z', end: '2100-12-31T00:00:00.000Z' }
    } = filters;

    const query = {
      deleted: false,
      validUntil: { $gte: new Date(validRange.start), $lte: new Date(validRange.end) },
      createdAt: { $gte: new Date(createdRange.start), $lte: new Date(createdRange.end) }
    };

    if (client) query.client = new RegExp(client, 'i');

    return Quotation.find(query);
  }
};

export default quotationQueries;
