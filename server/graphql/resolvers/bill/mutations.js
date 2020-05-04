import { Types } from 'mongoose';
import { Bill, ClientPrice, Folio, Ticket } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const billMutations = {
  bill: authenticated(
    async (_, { bill: { client, store, tickets: ticketIds, creditDays, bill: isBill } }) => {
      const productSummary = await Ticket.aggregate([
        {
          $match: {
            _id: { $in: [...ticketIds.map(ticket => Types.ObjectId(ticket))] },
            turn: { $exists: true },
            isBilled: false,
            disabled: false
          }
        },
        { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
        {
          $group: {
            _id: '$product',
            folios: {
              $push: {
                folio: '$folio'
              }
            },
            totalWeight: { $sum: '$totalWeight' },
            tax: { $sum: '$tax' },
            total: { $sum: '$totalPrice' }
          }
        },
        {
          $project: {
            _id: 0,
            product: '$_id',
            folios: '$folios',
            weight: '$totalWeight',
            tax: '$tax',
            total: '$total'
          }
        }
      ]);

      const products = [];
      const folios = [];
      let tax = 0;
      let total = 0;
      let price;

      for (let i = 0; i < productSummary.length; i++) {
        const {
          product,
          folios: productFolios,
          weight,
          tax: productTax,
          total: productTotal
        } = productSummary[i];

        // eslint-disable-next-line no-await-in-loop
        const specialPrice = await ClientPrice.find({ client, rock: product[0]._id }).sort({
          addedAt: 'descending'
        });

        if (!specialPrice[0] || specialPrice[0].noSpecialPrice) price = product[0].price;
        else price = specialPrice[0].price;

        tax += productTax;
        total += productTotal;

        productFolios.forEach(({ folio: folioId }) => {
          folios.push(folioId);
        });

        products.push({ product: product[0], price, weight, total: productTotal - productTax });
      }

      const folio = await Folio.findOneAndUpdate(
        { name: 'F' },
        { $inc: { count: 1 } },
        { new: false }
      ).select('name count');

      if (!folio) throw new Error('Es necesario crear los folios tipo F!');

      const bill = new Bill({
        folio: folio.name.toString() + folio.count.toString(),
        client,
        folios,
        products,
        tax,
        total,
        creditDays,
        bill: isBill
      });
      if (store) bill.store = store;

      try {
        await bill.save();
        await Ticket.updateMany(
          {
            _id: { $in: [...ticketIds.map(ticket => Types.ObjectId(ticket))] },
            turn: { $exists: true },
            isBilled: false,
            disabled: false
          },
          { isBilled: true }
        );

        return Bill.findById(bill.id).populate('client store');
      } catch (e) {
        return e;
      }
    }
  )
};

export default billMutations;
