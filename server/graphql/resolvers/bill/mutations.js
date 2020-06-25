import { Types } from 'mongoose';
import { Bill, Folio, Ticket } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const billMutations = {
  bill: authenticated(
    async (
      _,
      { bill: { client, store, tickets: ticketIds, creditDays, bill: isBill, turnToBill } }
    ) => {
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
            subtotal: { $sum: { $subtract: ['$totalPrice', '$tax'] } },
            tax: { $sum: '$tax' }
          }
        },
        {
          $project: {
            _id: 0,
            product: '$_id',
            folios: '$folios',
            weight: '$totalWeight',
            subtotal: '$subtotal',
            tax: '$tax'
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
          subtotal: productSubtotal,
          tax: productTax
        } = productSummary[i];

        const subtotalToAdd = !isBill && turnToBill ? productSubtotal / 1.16 : productSubtotal;
        const taxToAdd = !isBill && turnToBill ? subtotalToAdd * 0.16 : productTax;

        price = (subtotalToAdd / weight).toFixed(2);

        tax += taxToAdd;
        total += subtotalToAdd + taxToAdd;

        productFolios.forEach(({ folio: folioId }) => {
          folios.push(folioId);
        });

        products.push({ product: product[0], price, weight, total: subtotalToAdd });
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
        bill: isBill || turnToBill
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
  ),
  billDelete: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    try {
      const bill = await Bill.findById(id);

      await Bill.deleteById(id, userRequesting.id);
      await Ticket.updateMany(
        {
          folio: { $in: [...bill.folios] },
          turn: { $exists: true },
          isBilled: true,
          disabled: false
        },
        { isBilled: false }
      );

      return true;
    } catch (e) {
      return e;
    }
  })
};

export default billMutations;
